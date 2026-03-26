"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS } from "@/lib/types";
import StarRating from "@/components/StarRating";

export default function CollectPage() {
  const params = useParams();
  const collectLinkId = params.userId as string;
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const canNext = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return rating > 0;
    if (step === 3) return content.trim().length >= 10;
    return false;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Rechercher le propriétaire via collect_link_id
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

      // Vérifier si l'essai a expiré
      const isTrialExpired = profile.plan === "trial" &&
        new Date(profile.trial_ends_at).getTime() < Date.now();
      if (isTrialExpired) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      // Vérifier la limite de témoignages
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

      const { error: insertError } = await supabase.from("testimonials").insert({
        owner_id: profile.id,
        author_name: name.trim(),
        author_role: role.trim() || null,
        author_company: company.trim() || null,
        rating,
        content: content.trim(),
        status: "pending",
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">
            Lien invalide
          </h1>
          <p className="mt-3 text-stone-600">
            Ce lien de collecte n&apos;existe pas ou n&apos;est plus actif.
          </p>
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
          <h1 className="text-2xl font-bold text-stone-950 font-serif">
            Collecte temporairement indisponible
          </h1>
          <p className="mt-3 text-stone-600">
            Ce formulaire ne peut plus accepter de témoignages pour le moment. Veuillez contacter le propriétaire du formulaire.
          </p>
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
          <h1 className="text-2xl font-bold text-stone-950 font-serif">
            Merci pour votre témoignage !
          </h1>
          <p className="mt-3 text-stone-600">
            Votre avis a bien été envoyé et sera examiné prochainement.
          </p>
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
        </div>

        {/* Progress bar with labels */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${
                  i + 1 <= step ? "text-primary-500" : "text-stone-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  s <= step ? "bg-primary-500" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-950 mb-4">
                Qui êtes-vous ?
              </h2>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nom complet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Rôle / Poste
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Directeur Marketing"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Mon Entreprise"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold text-stone-950 mb-8">
                Quelle note donneriez-vous ?
              </h2>
              <div className="flex justify-center">
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onChange={setRating}
                />
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
              <h2 className="text-lg font-semibold text-stone-950 mb-4">
                Votre témoignage
              </h2>
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
          Propulsé par{" "}
          <span className="text-primary-500 font-medium">Louvi</span>
        </p>
      </div>
    </div>
  );
}
