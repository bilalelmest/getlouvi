"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial, Profile, PLAN_LIMITS } from "@/lib/types";
import TestimonialCard from "@/components/TestimonialCard";
import Link from "next/link";

type FilterStatus = "all" | "approved" | "pending" | "rejected";

export default function DashboardPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importName, setImportName] = useState("");
  const [importRating, setImportRating] = useState(5);
  const [importContent, setImportContent] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, testimonialsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("testimonials").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (!error) {
      setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    }
  };

  const copyCollectLink = async () => {
    if (!profile) return;
    const link = `${window.location.origin}/collect/${profile.collect_link_id}`;
    try { await navigator.clipboard.writeText(link); } catch {
      const ta = document.createElement("textarea"); ta.value = link;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = testimonials.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.author_name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || (t.author_company?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    pending: testimonials.filter((t) => t.status === "pending").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
    avgRating: testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : "—",
  };

  const planLimit = profile ? PLAN_LIMITS[profile.plan]?.testimonials || 10 : 10;
  const usagePercent = Math.min(100, Math.round((stats.total / planLimit) * 100));

  const filters: { label: string; value: FilterStatus; count: number }[] = [
    { label: "Tous", value: "all", count: stats.total },
    { label: "Approuvés", value: "approved", count: stats.approved },
    { label: "En attente", value: "pending", count: stats.pending },
    { label: "Refusés", value: "rejected", count: stats.rejected },
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif">Tableau de bord</h1>
          <p className="text-sm text-stone-600 mt-1">Gérez vos témoignages clients</p>
        </div>
        {profile && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-stone-500">Utilisation</p>
              <p className="text-sm font-semibold text-stone-700">
                {stats.total}/{planLimit === 999999 ? "∞" : planLimit} témoignages
              </p>
            </div>
            <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-yellow-500" : "bg-success"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">Total</p>
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-950">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">Approuvés</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">En attente</p>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">Note moyenne</p>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-star" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-950">{stats.avgRating}<span className="text-lg text-stone-400">{stats.avgRating !== "—" ? "/5" : ""}</span></p>
        </div>
      </div>

      {/* Collect Link */}
      {profile && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.072a4.5 4.5 0 010 6.364L10.5 19.94a4.5 4.5 0 01-6.364-6.364l4.5-4.5a4.5 4.5 0 017.244 1.242z" />
            </svg>
            <p className="text-sm font-medium text-stone-700">Votre lien de collecte</p>
          </div>
          <p className="text-xs text-stone-500 mb-3">Partagez ce lien avec vos clients pour recevoir des témoignages</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/collect/${profile.collect_link_id}`}
              className="flex-1 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-700 font-mono"
            />
            <button
              onClick={copyCollectLink}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-w-[100px] ${
                copied ? "bg-success text-white" : "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              }`}
            >
              {copied ? "✓ Copié !" : "Copier"}
            </button>
          </div>
        </div>
      )}

      {/* Form Mode Toggle */}
      {profile && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Mode du formulaire</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {(profile.form_mode || "b2c") === "b2c" ? "B2C : seul le nom est demandé" : "B2B : nom, rôle et entreprise"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${(profile.form_mode || "b2c") === "b2c" ? "text-primary-600" : "text-stone-400"}`}>B2C</span>
              <button
                onClick={async () => {
                  const current = profile.form_mode || "b2c";
                  const newMode = current === "b2b" ? "b2c" : "b2b";
                  await supabase.from("profiles").update({ form_mode: newMode }).eq("id", profile.id);
                  setProfile({ ...profile, form_mode: newMode });
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${(profile.form_mode || "b2c") === "b2b" ? "bg-primary-500" : "bg-stone-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${(profile.form_mode || "b2c") === "b2b" ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-xs font-medium ${(profile.form_mode || "b2c") === "b2b" ? "text-primary-600" : "text-stone-400"}`}>B2B</span>
            </div>
          </div>
        </div>
      )}

      {/* Import Google Review */}
      {profile && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <p className="text-sm font-medium text-stone-700">Importer un avis Google</p>
              </div>
              <p className="text-xs text-stone-500">Recopiez vos avis Google pour les afficher sur votre Wall of Love</p>
            </div>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2 border-stone-200 text-stone-700 hover:border-primary-400 hover:text-primary-600 transition-all duration-200"
            >
              + Importer
            </button>
          </div>
        </div>
      )}

      {/* Import Google Modal */}
      {showImportModal && profile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="text-lg font-bold text-stone-950 font-serif">Importer un avis Google</h2>
            </div>
            <p className="text-xs text-stone-500 mb-5">Recopiez les informations depuis votre fiche Google</p>

            {importError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">{importError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Nom de l&apos;auteur <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Note <span className="text-danger">*</span></label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setImportRating(star)}
                      className="p-1"
                    >
                      <svg className={`w-7 h-7 ${star <= importRating ? "text-star" : "text-stone-300"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Contenu de l&apos;avis <span className="text-danger">*</span></label>
                <textarea
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value.slice(0, 500))}
                  placeholder="Copiez-collez le texte de l'avis Google ici..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                />
                <p className="text-xs text-stone-400 mt-1 text-right">{importContent.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportName("");
                  setImportRating(5);
                  setImportContent("");
                  setImportError("");
                }}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={!importName.trim() || !importContent.trim() || importContent.trim().length < 10 || importLoading}
                onClick={async () => {
                  setImportError("");
                  setImportLoading(true);
                  const { error } = await supabase.from("testimonials").insert({
                    owner_id: profile.id,
                    author_name: importName.trim(),
                    rating: importRating,
                    content: importContent.trim(),
                    status: "approved",
                    source: "google",
                    gdpr_consent: true,
                  });
                  setImportLoading(false);
                  if (error) {
                    setImportError("Erreur lors de l'import. Réessayez.");
                  } else {
                    setShowImportModal(false);
                    setImportName("");
                    setImportRating(5);
                    setImportContent("");
                    fetchData();
                  }
                }}
                className="flex-1 gradient-primary text-white py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow disabled:opacity-50 disabled:shadow-none"
              >
                {importLoading ? "Import..." : "Importer l'avis"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-950 mb-2">Bienvenue sur Louvi !</h2>
          <p className="text-stone-600 mb-8 max-w-md mx-auto">
            Vous n&apos;avez pas encore de témoignages. Suivez ces 3 étapes simples pour commencer :
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
              <p className="font-semibold text-stone-950 text-sm">Copiez votre lien</p>
              <p className="text-xs text-stone-500 mt-1">Utilisez le lien de collecte ci-dessus</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
              <p className="font-semibold text-stone-950 text-sm">Partagez-le</p>
              <p className="text-xs text-stone-500 mt-1">Envoyez-le à vos clients par email</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
              <p className="font-semibold text-stone-950 text-sm">Modérez</p>
              <p className="text-xs text-stone-500 mt-1">Approuvez les témoignages ici</p>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={copyCollectLink}
              className="gradient-primary text-white px-8 py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200"
            >
              {copied ? "✓ Lien copié !" : "Copier mon lien de collecte"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Limit warning */}
          {usagePercent >= 80 && planLimit !== 999999 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  Vous avez utilisé <strong>{stats.total}/{planLimit}</strong> témoignages de votre plan.
                  {usagePercent >= 100 ? " Passez à un plan supérieur pour continuer." : " Pensez à passer à un plan supérieur."}
                </p>
              </div>
              <Link href="/dashboard/upgrade" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 whitespace-nowrap ml-4">
                Voir les plans →
              </Link>
            </div>
          )}

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === f.value
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-primary-300"
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 text-xs ${filter === f.value ? "text-primary-200" : "text-stone-400"}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative">
                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom, entreprise ou contenu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
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
