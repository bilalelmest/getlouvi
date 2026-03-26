"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial, Profile } from "@/lib/types";
import TestimonialCard from "@/components/TestimonialCard";

type FilterStatus = "all" | "approved" | "pending" | "rejected";

export default function DashboardPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
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
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("testimonials")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    }
  };

  const copyCollectLink = async () => {
    if (!profile) return;
    const link = `${window.location.origin}/collect/${profile.collect_link_id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = testimonials.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.author_name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.author_company?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    pending: testimonials.filter((t) => t.status === "pending").length,
    avgRating:
      testimonials.length > 0
        ? (
            testimonials.reduce((sum, t) => sum + t.rating, 0) /
            testimonials.length
          ).toFixed(1)
        : "—",
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "Tous", value: "all" },
    { label: "Approuvés", value: "approved" },
    { label: "En attente", value: "pending" },
    { label: "Refusés", value: "rejected" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-950 font-serif">
          Tableau de bord
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Gérez vos témoignages clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "text-primary-500",
            icon: (
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            ),
          },
          {
            label: "Approuvés",
            value: stats.approved,
            color: "text-success",
            icon: (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "En attente",
            value: stats.pending,
            color: "text-star",
            icon: (
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Note moyenne",
            value: stats.avgRating === "—" ? "—" : `${stats.avgRating}/5`,
            color: "text-star",
            icon: (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-stone-200 p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-sm text-stone-600">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-stone-50">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Collect Link */}
      {profile && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-8">
          <p className="text-sm font-medium text-stone-700 mb-2">
            Votre lien de collecte — partagez-le avec vos clients
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/collect/${profile.collect_link_id}`}
              className="flex-1 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-700 font-mono"
            />
            <button
              onClick={copyCollectLink}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                copied
                  ? "bg-success text-white"
                  : "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              }`}
            >
              {copied ? "✓ Copié !" : "Copier"}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-950 mb-2">
            Bienvenue sur Louvi !
          </h2>
          <p className="text-stone-600 mb-6 max-w-md mx-auto">
            Vous n&apos;avez pas encore de témoignages. Voici comment commencer :
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-stone-950 text-sm">Copiez votre lien</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Utilisez le lien de collecte ci-dessus
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-stone-950 text-sm">Partagez-le</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Envoyez-le à vos clients par email ou message
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-stone-950 text-sm">Modérez</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Approuvez les témoignages reçus ici
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filter === f.value
                      ? "bg-primary-500 text-white"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-primary-300"
                  }`}
                >
                  {f.label}
                  {f.value !== "all" && (
                    <span className="ml-1.5 text-xs opacity-75">
                      {f.value === "approved" ? stats.approved : f.value === "pending" ? stats.pending : testimonials.filter(t => t.status === "rejected").length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, entreprise ou contenu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Testimonials List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">Aucun témoignage ne correspond à votre recherche</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((t) => (
                <TestimonialCard
                  key={t.id}
                  testimonial={t}
                  showStatus
                  onApprove={(id) => updateStatus(id, "approved")}
                  onReject={(id) => updateStatus(id, "rejected")}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
