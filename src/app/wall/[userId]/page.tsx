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
                  <Avatar name={t.author_name} size="sm" />
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
                  <Avatar name={t.author_name} size="sm" />
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
                <Avatar name={t.author_name} size="sm" />
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
                  <Avatar name={t.author_name} />
                  <div>
                    <p className="font-semibold text-stone-950 text-sm">{t.author_name}</p>
                    <p className="text-xs text-stone-500">
                      {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <StarRating rating={t.rating} size="sm" />
                <p className="mt-3 text-sm text-stone-700 leading-relaxed">{t.content}</p>
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
