"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS } from "@/lib/types";
import StarRating from "@/components/StarRating";

export default function CollectPage() {
  const params = useParams();
  const collectLinkId = params.userId as string;
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [formMode, setFormMode] = useState<"b2b" | "b2c">("b2c");
  const [companyName, setCompanyName] = useState("");
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  // Load form config on mount
  useEffect(() => {
    const loadConfig = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("form_mode, company_name")
        .eq("collect_link_id", collectLinkId)
        .single();

      if (profile) {
        setFormMode(profile.form_mode || "b2b");
        setCompanyName(profile.company_name || "");
      }

      // Get testimonial count for social proof
      const { data: owner } = await supabase
        .from("profiles")
        .select("id")
        .eq("collect_link_id", collectLinkId)
        .single();

      if (owner) {
        const { count } = await supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", owner.id);
        setTestimonialCount(count || 0);
      } else {
        setNotFound(true);
      }
      setPageLoading(false);
    };
    loadConfig();
  }, [collectLinkId, supabase]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Format accepté : JPG, PNG ou WebP.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("La photo ne doit pas dépasser 2 Mo.");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const canNext = () => {
    if (step === 1) return firstName.trim().length > 0 && lastName.trim().length > 0;
    if (step === 2) return rating > 0;
    if (step === 3) return content.trim().length >= 10 && gdprConsent;
    return false;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, plan, trial_ends_at")
        .eq("collect_link_id", collectLinkId)
        .single();

      if (profileError || !profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const isTrialExpired = profile.plan === "trial" &&
        new Date(profile.trial_ends_at).getTime() < Date.now();
      if (isTrialExpired) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      const planLimit = PLAN_LIMITS[profile.plan]?.testimonials || 10;
      const { count } = await supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", profile.id);

      if (count !== null && count >= planLimit) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      // Upload photo if provided
      let photoUrl: string | null = null;
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, photoFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from("testimonials").insert({
        owner_id: profile.id,
        author_name: `${firstName.trim()} ${lastName.trim()}`,
        author_role: formMode === "b2b" ? (role.trim() || null) : null,
        author_company: formMode === "b2b" ? (company.trim() || null) : null,
        author_photo_url: photoUrl,
        rating,
        content: content.trim(),
        status: "pending",
        gdpr_consent: true,
      });

      if (insertError) {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">Lien invalide</h1>
          <p className="mt-3 text-stone-600">Ce lien de collecte n&apos;existe pas ou n&apos;est plus actif.</p>
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">Collecte temporairement indisponible</h1>
          <p className="mt-3 text-stone-600">Ce formulaire ne peut plus accepter de témoignages pour le moment.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">Merci pour votre témoignage !</h1>
          <p className="mt-3 text-stone-600">Votre avis a bien été envoyé et sera examiné prochainement.</p>
        </div>
      </div>
    );
  }

  const stepLabels = ["Vos infos", "Votre note", "Votre avis"];

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-950 font-serif">
            Partagez votre expérience
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Votre avis compte et nous aide à nous améliorer
          </p>
          {testimonialCount > 0 && (
            <p className="mt-3 inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Rejoignez {testimonialCount} personne{testimonialCount > 1 ? "s" : ""} qui ont partagé leur avis
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepLabels.map((label, i) => (
              <span key={label} className={`text-xs font-medium ${i + 1 <= step ? "text-primary-500" : "text-stone-400"}`}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-primary-500" : "bg-stone-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-950 mb-4">Qui êtes-vous ?</h2>

              {/* Photo upload */}
              <div className="flex justify-center mb-2">
                <label className="cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden group-hover:border-primary-400 transition-colors">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <svg className="w-6 h-6 text-stone-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        <span className="text-[10px] text-stone-400 mt-0.5 block">Photo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
              <p className="text-center text-xs text-stone-400 -mt-2">Optionnel — max 2 Mo</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Prénom <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Nom <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {formMode === "b2b" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Rôle / Poste</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Directeur Marketing"
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Entreprise</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Mon Entreprise"
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold text-stone-950 mb-8">Quelle note donneriez-vous ?</h2>
              <div className="flex justify-center">
                <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              </div>
              {rating > 0 && (
                <p className="mt-6 text-sm text-stone-500">
                  {rating}/5 étoile{rating > 1 ? "s" : ""} —{" "}
                  {rating === 5 ? "Excellent !" : rating === 4 ? "Très bien !" : rating === 3 ? "Bien" : rating === 2 ? "Moyen" : "Décevant"}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-950 mb-4">Votre témoignage</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="Décrivez votre expérience en quelques phrases..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
              />
              <div className="flex justify-between mt-2">
                <p className={`text-xs ${content.trim().length < 10 ? "text-danger" : "text-success"}`}>
                  {content.trim().length < 10
                    ? `Encore ${10 - content.trim().length} caractère${10 - content.trim().length > 1 ? "s" : ""} minimum`
                    : "✓ Longueur suffisante"}
                </p>
                <p className={`text-xs ${content.length > 450 ? "text-danger" : "text-stone-400"}`}>
                  {content.length}/500
                </p>
              </div>

              {/* RGPD Consent */}
              <label className="flex items-start gap-3 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  J&apos;autorise <strong>{companyName || "cette entreprise"}</strong> à publier mon avis
                  {photoFile ? ", ma photo" : ""} et mon nom à des fins marketing et de communication.
                  <span className="text-danger"> *</span>
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-lg border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors duration-200"
              >
                Retour
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex-1 gradient-primary text-white py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200 disabled:opacity-50 disabled:shadow-none"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className="flex-1 gradient-primary text-white py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? "Envoi en cours..." : "Envoyer mon témoignage"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Propulsé par <span className="text-primary-500 font-medium">Louvi</span>
        </p>
      </div>
    </div>
  );
}
