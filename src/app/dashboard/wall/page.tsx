"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial, Profile } from "@/lib/types";
import TestimonialCard from "@/components/TestimonialCard";

export default function WallOfLovePage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copiedWall, setCopiedWall] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, testimonialsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("testimonials")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyLink = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const wallUrl = profile ? `${typeof window !== "undefined" ? window.location.origin : ""}/wall/${profile.collect_link_id}` : "";
  const embedCode = `<iframe src="${wallUrl}" width="100%" height="600" frameborder="0" style="border:none;border-radius:14px;overflow:hidden;"></iframe>`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">
            Wall of Love
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {testimonials.length} témoignage{testimonials.length > 1 ? "s" : ""} approuvé{testimonials.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copyLink(wallUrl, setCopiedWall)}
            className="gradient-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
          >
            {copiedWall ? "✓ Copié !" : "Copier le lien public"}
          </button>
          <button
            onClick={() => copyLink(embedCode, setCopiedEmbed)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-stone-300 text-stone-700 hover:border-primary-300 transition-colors duration-200"
          >
            {copiedEmbed ? "✓ Copié !" : "Copier l'iframe"}
          </button>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-950 mb-2">
            Votre Wall of Love est vide
          </h2>
          <p className="text-stone-600 max-w-md mx-auto">
            Approuvez des témoignages depuis le tableau de bord pour les afficher ici.
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}
    </div>
  );
}
