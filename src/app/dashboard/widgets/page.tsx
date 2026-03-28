"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial, Profile, PLAN_LIMITS, WidgetStyle } from "@/lib/types";
import Avatar from "@/components/Avatar";
import StarRating from "@/components/StarRating";
import GoogleBadge from "@/components/GoogleBadge";

type ThemeMode = "light" | "dark";

function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 opacity-10 ${className}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
    </svg>
  );
}

export default function WidgetsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [style, setStyle] = useState<WidgetStyle>("grid");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<"iframe" | "script">("iframe");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const carouselRef = useRef<HTMLDivElement>(null);

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
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEmbedCode = () => {
    if (!profile) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const height = style === "badge" ? "300" : "500";
    if (embedType === "script") {
      return `<div id="louvi-widget"></div>\n<script src="${origin}/embed.js" data-id="${profile.collect_link_id}" data-widget="${style}" data-theme="${theme}"></script>`;
    }
    return `<iframe src="${origin}/wall/${profile.collect_link_id}?widget=${style}&theme=${theme}" width="100%" height="${height}" frameborder="0" style="border:none;border-radius:14px;overflow:hidden;"></iframe>`;
  };

  const copyCode = async () => {
    const code = getEmbedCode();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const isDark = theme === "dark";
  const bg = isDark ? "bg-stone-900" : "bg-white";
  const text = isDark ? "text-white" : "text-stone-950";
  const subtext = isDark ? "text-stone-400" : "text-stone-600";
  const border = isDark ? "border-stone-700" : "border-stone-200";
  const cardBg = isDark ? "bg-stone-800" : "bg-stone-50";
  const arrowBg = isDark ? "bg-stone-700 hover:bg-stone-600 text-white" : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200";

  const planConfig = profile ? PLAN_LIMITS[profile.plan] : PLAN_LIMITS.trial;
  const allowedWidgets = planConfig?.widgets || ["grid", "list"];
  const allowDarkTheme = planConfig?.darkTheme || false;

  const styles: { value: WidgetStyle; label: string; icon: string; desc: string }[] = [
    { value: "grid", label: "Grille", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z", desc: "2 colonnes" },
    { value: "carousel", label: "Carrousel", icon: "M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18", desc: "Defilant" },
    { value: "list", label: "Liste", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z", desc: "Vertical" },
    { value: "badge", label: "Badge", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z", desc: "Compact" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const demoTestimonials: Testimonial[] = testimonials.length > 0 ? testimonials : [
    {
      id: "demo-1", owner_id: "", author_name: "Marie Dupont", author_role: "CEO",
      author_company: "TechStart", author_photo_url: null, rating: 5,
      content: "Un outil incroyable qui a transforme notre approche client. Je recommande vivement !",
      status: "approved", tag: null, source: null, gdpr_consent: true, created_at: new Date().toISOString(),
    },
    {
      id: "demo-2", owner_id: "", author_name: "Thomas Bernard", author_role: "CTO",
      author_company: "DataFlow", author_photo_url: null, rating: 4,
      content: "Simple, efficace et elegant. Le widget s'integre parfaitement a notre site.",
      status: "approved", tag: null, source: "google", gdpr_consent: true, created_at: new Date().toISOString(),
    },
    {
      id: "demo-3", owner_id: "", author_name: "Sophie Martin", author_role: "Directrice Design",
      author_company: "CreativeStudio", author_photo_url: null, rating: 5,
      content: "Le design est magnifique. Mes clients sont impressionnes par la presentation.",
      status: "approved", tag: null, source: null, gdpr_consent: true, created_at: new Date().toISOString(),
    },
    {
      id: "demo-4", owner_id: "", author_name: "Lucas Moreau", author_role: "Fondateur",
      author_company: "StartupLab", author_photo_url: null, rating: 5,
      content: "Exactement ce qu'il nous fallait pour mettre en avant nos avis clients.",
      status: "approved", tag: null, source: "google", gdpr_consent: true, created_at: new Date().toISOString(),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-950 font-serif">Widgets</h1>
        <p className="text-sm text-stone-600 mt-1">
          Personnalisez et integrez vos temoignages sur votre site
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
        <div className="flex flex-col gap-5">
          {/* Style selector */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2.5">Style du widget</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {styles.map((s) => {
                const locked = !allowedWidgets.includes(s.value);
                return (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      style === s.value
                        ? locked
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {locked && (
                      <svg className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                    <span>{s.label}</span>
                    <span className="text-[10px] opacity-60">{s.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme selector */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2.5">Theme</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-2 ${
                  theme === "light"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Clair
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 relative border-2 ${
                  theme === "dark"
                    ? !allowDarkTheme
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {!allowDarkTheme && (
                  <svg className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                Sombre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview + Embed */}
      {(() => {
        const isStyleLocked = !allowedWidgets.includes(style);
        const isThemeLocked = theme === "dark" && !allowDarkTheme;
        const isLocked = isStyleLocked || isThemeLocked;

        return (
          <>
            {/* Preview */}
            <div className={`rounded-2xl border ${border} p-8 mb-6 ${bg} transition-colors duration-300 relative overflow-hidden`}>
              {isLocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl z-10 flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-stone-800">Disponible avec le plan Pro</p>
                  <a href="/dashboard/upgrade" className="mt-2 text-xs gradient-primary text-white px-4 py-1.5 rounded-lg font-medium shadow-lg shadow-primary-500/25">
                    Passer au Pro
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-stone-600" : "bg-stone-300"}`} />
                <h3 className={`text-center font-serif text-sm font-medium ${subtext}`}>
                  Apercu — {styles.find((s) => s.value === style)?.label}
                </h3>
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-stone-600" : "bg-stone-300"}`} />
              </div>

              {style === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoTestimonials.slice(0, 4).map((t) => (
                    <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-5 hover:shadow-lg transition-all duration-300 relative`}>
                      <QuoteIcon className={isDark ? "text-white" : "text-stone-950"} />
                      <div className="flex items-center gap-3 mb-3 mt-1">
                        <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${text} truncate`}>{t.author_name}</p>
                          <p className={`text-xs ${subtext} truncate`}>
                            {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {t.source === "google" && (
                          <GoogleBadge className={isDark ? "bg-stone-700 text-stone-300" : ""} />
                        )}
                      </div>
                      <StarRating rating={t.rating} size="sm" />
                      <p className={`mt-2 text-sm leading-relaxed ${subtext}`}>{t.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {style === "carousel" && (
                <div className="relative">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${arrowBg}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${arrowBg}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <div
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {demoTestimonials.map((t) => (
                      <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-5 min-w-[300px] max-w-[340px] snap-center shrink-0 hover:shadow-lg transition-all duration-300 relative`}>
                        <QuoteIcon className={isDark ? "text-white" : "text-stone-950"} />
                        <div className="flex items-center gap-3 mb-3 mt-1">
                          <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${text} truncate`}>{t.author_name}</p>
                            <p className={`text-xs ${subtext} truncate`}>
                              {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          {t.source === "google" && (
                            <GoogleBadge className={isDark ? "bg-stone-700 text-stone-300" : ""} />
                          )}
                        </div>
                        <StarRating rating={t.rating} size="sm" />
                        <p className={`mt-2 text-sm leading-relaxed ${subtext}`}>{t.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {style === "list" && (
                <div className="space-y-3 max-w-xl mx-auto">
                  {demoTestimonials.slice(0, 4).map((t) => (
                    <div key={t.id} className={`${cardBg} rounded-xl border ${border} p-4 flex items-start gap-4 hover:shadow-md transition-all duration-300`}>
                      <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`font-semibold text-sm ${text} truncate`}>{t.author_name}</p>
                            {t.source === "google" && (
                              <GoogleBadge className={isDark ? "bg-stone-700 text-stone-300" : ""} />
                            )}
                          </div>
                          <StarRating rating={t.rating} size="sm" />
                        </div>
                        <p className={`text-xs ${subtext} mb-1`}>
                          {[t.author_role, t.author_company].filter(Boolean).join(" · ")}
                        </p>
                        <p className={`text-sm leading-relaxed ${subtext}`}>{t.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {style === "badge" && (
                <div className="flex justify-center">
                  <div className={`${cardBg} rounded-2xl border ${border} p-8 text-center max-w-xs shadow-sm`}>
                    <div className="flex justify-center mb-3">
                      <StarRating
                        rating={Math.round(
                          demoTestimonials.reduce((s, t) => s + t.rating, 0) / demoTestimonials.length
                        )}
                        size="md"
                      />
                    </div>
                    <p className={`text-4xl font-bold ${text}`}>
                      {(demoTestimonials.reduce((s, t) => s + t.rating, 0) / demoTestimonials.length).toFixed(1)}
                      <span className={`text-lg font-normal ${subtext}`}>/5</span>
                    </p>
                    <p className={`text-sm ${subtext} mt-1`}>
                      {demoTestimonials.length} avis client{demoTestimonials.length > 1 ? "s" : ""}
                    </p>
                    {(() => {
                      const googleCount = demoTestimonials.filter(t => t.source === "google").length;
                      const louviCount = demoTestimonials.length - googleCount;
                      return (googleCount > 0) ? (
                        <div className={`flex items-center justify-center gap-3 mt-3 pt-3 border-t ${border}`}>
                          {louviCount > 0 && (
                            <span className={`text-xs ${subtext}`}>
                              <span className="text-primary-500 font-medium">{louviCount}</span> Louvi
                            </span>
                          )}
                          <span className={`text-xs ${subtext} inline-flex items-center gap-1`}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span className="font-medium">{googleCount}</span> Google
                          </span>
                        </div>
                      ) : null;
                    })()}
                    <p className="text-xs text-primary-500 mt-4 font-medium">
                      Propulse par Louvi
                    </p>
                  </div>
                </div>
              )}

              {/* Footer for non-badge widgets */}
              {style !== "badge" && (
                <p className={`text-center text-xs mt-6 ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                  Propulse par <span className="text-primary-500 font-medium">Louvi</span>
                </p>
              )}
            </div>

            {/* Embed Code */}
            {isLocked ? (
              <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                <p className="text-sm text-stone-600">
                  Passez au <strong>plan Pro</strong> pour utiliser ce widget et obtenir le code d&apos;integration.
                </p>
                <a href="/dashboard/upgrade" className="inline-block mt-3 gradient-primary text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25">
                  Voir les plans
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-950">Code d&apos;integration</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Copiez ce code et collez-le dans votre site web</p>
                  </div>
                  <button
                    onClick={copyCode}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      copied
                        ? "bg-success text-white"
                        : "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                    }`}
                  >
                    {copied ? "Copie !" : "Copier le code"}
                  </button>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setEmbedType("iframe")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      embedType === "iframe" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    iFrame
                  </button>
                  <button
                    onClick={() => setEmbedType("script")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      embedType === "script" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Script JS (SEO)
                  </button>
                </div>
                <pre className="bg-stone-900 text-green-400 p-4 rounded-lg text-xs sm:text-sm overflow-x-auto">
                  <code>{getEmbedCode()}</code>
                </pre>
                {embedType === "script" && (
                  <p className="text-xs text-stone-500 mt-2">Le script injecte le widget directement dans le DOM — meilleur pour le SEO.</p>
                )}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
