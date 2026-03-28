"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Testimonial } from "@/lib/types";
import Avatar from "@/components/Avatar";
import StarRating from "@/components/StarRating";

export default function PublicWallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const collectLinkId = params.userId as string;
  const widgetStyle = searchParams.get("widget") || null;
  const theme = searchParams.get("theme") || "light";
  const supabase = createClient();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, company_name")
        .eq("collect_link_id", collectLinkId)
        .single();

      if (!profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCompanyName(profile.company_name);

      const { data: testimonialData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("owner_id", profile.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (testimonialData) setTestimonials(testimonialData);
      setLoading(false);
    };

    fetchData();
  }, [collectLinkId, supabase]);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-stone-900" : "bg-stone-50";
  const cardBg = isDark ? "bg-stone-800" : "bg-white";
  const text = isDark ? "text-white" : "text-stone-950";
  const subtext = isDark ? "text-stone-400" : "text-stone-600";
  const border = isDark ? "border-stone-700" : "border-stone-200";

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center px-6`}>
        <p className={subtext}>Ce wall n&apos;existe pas.</p>
      </div>
    );
  }

  // Widget mode — embedded via iframe
  if (widgetStyle) {
    return (
      <div className={`min-h-screen ${bg} p-6`}>
        {widgetStyle === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                  <div>
                    <p className={`font-semibold text-sm ${text}`}>{t.author_name}</p>
                    <p className={`text-xs ${subtext}`}>
                      {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <StarRating rating={t.rating} size="sm" />
                <p className={`mt-2 text-sm ${subtext}`}>{t.content}</p>
              </div>
            ))}
          </div>
        )}

        {widgetStyle === "carousel" && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {testimonials.map((t) => (
              <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-5 min-w-[300px] snap-center shrink-0`}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                  <div>
                    <p className={`font-semibold text-sm ${text}`}>{t.author_name}</p>
                    <p className={`text-xs ${subtext}`}>
                      {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <StarRating rating={t.rating} size="sm" />
                <p className={`mt-2 text-sm ${subtext}`}>{t.content}</p>
              </div>
            ))}
          </div>
        )}

        {widgetStyle === "list" && (
          <div className="space-y-3 max-w-xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-4 flex items-start gap-4`}>
                <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-sm ${text}`}>{t.author_name}</p>
                    <StarRating rating={t.rating} size="sm" />
                  </div>
                  <p className={`text-xs ${subtext} mb-1`}>
                    {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                  </p>
                  <p className={`text-sm ${subtext}`}>{t.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {widgetStyle === "badge" && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className={`${cardBg} rounded-xl border ${border} p-6 text-center max-w-xs`}>
              <div className="flex justify-center mb-2">
                <StarRating
                  rating={testimonials.length > 0
                    ? Math.round(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length)
                    : 0}
                  size="md"
                />
              </div>
              <p className={`text-2xl font-bold ${text}`}>
                {testimonials.length > 0
                  ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
                  : "0"}/5
              </p>
              <p className={`text-sm ${subtext} mt-1`}>
                Basé sur {testimonials.length} avis
              </p>
              <p className="text-xs text-primary-500 mt-3 font-medium">
                Propulsé par Louvi
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full public wall page
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-950 font-serif">
            {companyName ? `Ce que nos clients disent de ${companyName}` : "Nos témoignages clients"}
          </h1>
          <p className="mt-3 text-stone-600">
            Découvrez les avis authentiques de nos clients
          </p>
          {testimonials.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <StarRating
                rating={Math.round(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length)}
                size="md"
              />
              <span className="text-stone-700 font-semibold">
                {(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)}/5
              </span>
              <span className="text-stone-500 text-sm">
                ({testimonials.length} avis)
              </span>
            </div>
          )}
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">Aucun témoignage pour le moment</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={t.author_name} photoUrl={t.author_photo_url} />
                  <div>
                    <p className="font-semibold text-stone-950 text-sm">{t.author_name}</p>
                    <p className="text-xs text-stone-500">
                      {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <StarRating rating={t.rating} size="sm" />
                <p className="mt-3 text-sm text-stone-700 leading-relaxed">{t.content}</p>
                {t.source === "google" && (
                  <div className="mt-3 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xs text-stone-400">Avis Google</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <p className="text-xs text-stone-400">
            Propulsé par{" "}
            <span className="text-primary-500 font-medium">Louvi</span>
          </p>
        </div>
      </div>
    </div>
  );
}
