"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial, Profile, PLAN_LIMITS, WidgetStyle } from "@/lib/types";
import Avatar from "@/components/Avatar";
import StarRating from "@/components/StarRating";

type ThemeMode = "light" | "dark";

export default function WidgetsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [style, setStyle] = useState<WidgetStyle>("grid");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<"iframe" | "script">("iframe");
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
    const height = style === "badge" ? "250" : "500";
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

  const isDark = theme === "dark";
  const bg = isDark ? "bg-stone-900" : "bg-white";
  const text = isDark ? "text-white" : "text-stone-950";
  const subtext = isDark ? "text-stone-400" : "text-stone-600";
  const border = isDark ? "border-stone-700" : "border-stone-200";
  const cardBg = isDark ? "bg-stone-800" : "bg-stone-50";

  const planConfig = profile ? PLAN_LIMITS[profile.plan] : PLAN_LIMITS.trial;
  const allowedWidgets = planConfig?.widgets || ["grid", "list"];
  const allowDarkTheme = planConfig?.darkTheme || false;

  const styles: { value: WidgetStyle; label: string; desc: string }[] = [
    { value: "grid", label: "Grille", desc: "2 colonnes" },
    { value: "carousel", label: "Carrousel", desc: "Défilant" },
    { value: "list", label: "Liste", desc: "Vertical" },
    { value: "badge", label: "Badge", desc: "Compact" },
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
      content: "Un outil incroyable qui a transformé notre approche client. Je recommande vivement !",
      status: "approved", tag: null, gdpr_consent: true, source: null, created_at: new Date().toISOString(),
    },
    {
      id: "demo-2", owner_id: "", author_name: "Thomas Bernard", author_role: "CTO",
      author_company: "DataFlow", author_photo_url: null, rating: 4,
      content: "Simple, efficace et élégant. Le widget s'intègre parfaitement à notre site.",
      status: "approved", tag: null, source: null, gdpr_consent: true, created_at: new Date().toISOString(),
    },
    {
      id: "demo-3", owner_id: "", author_name: "Sophie Martin", author_role: "Directrice Design",
      author_company: "CreativeStudio", author_photo_url: null, rating: 5,
      content: "Le design est magnifique. Mes clients sont impressionnés par la présentation.",
      status: "approved", tag: null, source: null, gdpr_consent: true, created_at: new Date().toISOString(),
    },
    {
      id: "demo-4", owner_id: "", author_name: "Lucas Moreau", author_role: "Fondateur",
      author_company: "StartupLab", author_photo_url: null, rating: 5,
      content: "Exactement ce qu'il nous fallait pour mettre en avant nos avis clients.",
      status: "approved", tag: null, source: null, gdpr_consent: true, created_at: new Date().toISOString(),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-950 font-serif">Widgets</h1>
        <p className="text-sm text-stone-600 mt-1">
          Personnalisez et intégrez vos témoignages sur votre site
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Style</p>
            <div className="flex gap-2">
              {styles.map((s) => {
                const locked = !allowedWidgets.includes(s.value);
                return (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      style === s.value
                        ? locked ? "bg-amber-500 text-white shadow-md" : "bg-primary-500 text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {locked && (
                      <svg className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Thème</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  theme === "light"
                    ? "bg-primary-500 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Clair
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 relative ${
                  theme === "dark"
                    ? !allowDarkTheme ? "bg-amber-500 text-white shadow-md" : "bg-primary-500 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {!allowDarkTheme && (
                  <svg className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Preview */}
      {(() => { const isStyleLocked = !allowedWidgets.includes(style); const isThemeLocked = theme === "dark" && !allowDarkTheme; const isLocked = isStyleLocked || isThemeLocked; return (
      <>
      <div className={`rounded-xl border ${border} p-8 mb-6 ${bg} transition-colors duration-300 relative`}>
        {isLocked && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl z-10 flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-amber-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-stone-800">Disponible avec le plan Pro</p>
            <a href="/dashboard/upgrade" className="mt-2 text-xs gradient-primary text-white px-4 py-1.5 rounded-lg font-medium">Passer au Pro</a>
          </div>
        )}
        <h3 className={`text-center font-serif text-sm font-medium mb-6 ${subtext}`}>
          Aperçu — {styles.find((s) => s.value === style)?.label} ({theme === "light" ? "clair" : "sombre"})
        </h3>

        {style === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoTestimonials.slice(0, 4).map((t) => (
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
                <p className={`mt-2 text-sm leading-relaxed ${subtext}`}>{t.content}</p>
              </div>
            ))}
          </div>
        )}

        {style === "carousel" && (
          <div className="overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {demoTestimonials.map((t) => (
                <div
                  key={t.id}
                  className={`${cardBg} rounded-xl border ${border} p-5 min-w-[300px] snap-center shrink-0`}
                >
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
                  <p className={`mt-2 text-sm leading-relaxed ${subtext}`}>{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {style === "list" && (
          <div className="space-y-3 max-w-xl mx-auto">
            {demoTestimonials.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className={`${cardBg} rounded-xl border ${border} p-4 flex items-start gap-4`}
              >
                <Avatar name={t.author_name} photoUrl={t.author_photo_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-sm ${text}`}>{t.author_name}</p>
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
            <div className={`${cardBg} rounded-xl border ${border} p-6 text-center max-w-xs`}>
              <div className="flex justify-center mb-2">
                <StarRating
                  rating={Math.round(
                    demoTestimonials.reduce((s, t) => s + t.rating, 0) / demoTestimonials.length
                  )}
                  size="md"
                />
              </div>
              <p className={`text-3xl font-bold ${text}`}>
                {(demoTestimonials.reduce((s, t) => s + t.rating, 0) / demoTestimonials.length).toFixed(1)}/5
              </p>
              <p className={`text-sm ${subtext} mt-1`}>
                Basé sur {demoTestimonials.length} avis
              </p>
              <p className="text-xs text-primary-500 mt-3 font-medium">
                Propulsé par Louvi
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Embed Code */}
      {isLocked ? (
        <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
          <p className="text-sm text-stone-600">
            Passez au <strong>plan Pro</strong> pour utiliser ce widget et obtenir le code d&apos;intégration.
          </p>
          <a href="/dashboard/upgrade" className="inline-block mt-3 gradient-primary text-white px-5 py-2 rounded-lg text-sm font-medium">
            Voir les plans
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-stone-950">Code d&apos;intégration</h3>
              <p className="text-xs text-stone-500 mt-0.5">Copiez ce code et collez-le dans votre site web</p>
            </div>
            <button
              onClick={copyCode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                copied
                  ? "bg-success text-white"
                  : "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              }`}
            >
              {copied ? "✓ Copié !" : "Copier le code"}
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
          <pre className="bg-stone-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{getEmbedCode()}</code>
          </pre>
          {embedType === "script" && (
            <p className="text-xs text-stone-500 mt-2">Le script injecte le widget directement dans le DOM — meilleur pour le SEO.</p>
          )}
        </div>
      )}
      </>
      ); })()}
    </div>
  );
}
