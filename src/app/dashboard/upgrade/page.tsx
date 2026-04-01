"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, PLAN_LIMITS } from "@/lib/types";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    features: ["50 témoignages", "1 formulaire de collecte", "Wall of Love", "2 styles de widgets", "Support par email"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 39,
    features: ["500 témoignages", "Formulaires illimités", "Wall of Love", "4 styles de widgets", "Thème clair & sombre", "Widget badge", "Support prioritaire"],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    features: ["Témoignages illimités", "Formulaires illimités", "Tous les widgets", "Domaine personnalisé (bientôt)", "API access (bientôt)", "Support dédié", "Analytics avancés (bientôt)"],
    popular: false,
  },
];

export default function UpgradePage() {
  const [annual, setAnnual] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data);
      }
    };
    getProfile();
  }, [supabase]);

  // Re-fetch profile after successful payment to get updated plan
  useEffect(() => {
    if (success) {
      const interval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (data && data.plan !== "trial") {
            setProfile(data);
            clearInterval(interval);
          }
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [success, supabase]);

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isExpired = profile?.plan === "trial" && trialDaysLeft <= 0;
  const isPaid = profile?.plan && profile.plan !== "trial";
  const currentPlanLabel = profile ? (PLAN_LIMITS[profile.plan]?.label || profile.plan) : "";

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, annual }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur: " + (err instanceof Error ? err.message : "inconnue"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Une erreur est survenue");
      }
    } catch {
      alert("Erreur de connexion au serveur");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success / Canceled banners */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Paiement réussi !</p>
            <p className="text-sm text-green-700">Merci ! Votre abonnement est maintenant actif.</p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="font-medium">Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        {isExpired ? (
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Votre essai gratuit de 7 jours a expiré
          </div>
        ) : profile?.plan === "trial" ? (
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} restant{trialDaysLeft > 1 ? "s" : ""} sur votre essai
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Plan actuel : {currentPlanLabel}
          </div>
        )}

        <h1 className="text-3xl font-bold text-stone-950 font-serif">
          {isExpired ? "Choisissez un plan pour continuer" : "Nos tarifs"}
        </h1>
        <p className="mt-3 text-stone-600 max-w-lg mx-auto">
          {isExpired
            ? "Votre essai est terminé. Choisissez le plan adapté à vos besoins pour continuer à utiliser Louvi."
            : "Des plans flexibles pour toutes les tailles d'entreprise. Paiement sécurisé par Stripe."}
        </p>

        {/* Manage subscription button for paid users */}
        {isPaid && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {portalLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            )}
            Gérer mon abonnement
          </button>
        )}
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm ${!annual ? "text-stone-950 font-medium" : "text-stone-500"}`}>Mensuel</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${annual ? "bg-primary-500" : "bg-stone-300"}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${annual ? "translate-x-7" : "translate-x-0.5"}`} />
        </button>
        <span className={`text-sm ${annual ? "text-stone-950 font-medium" : "text-stone-500"}`}>
          Annuel <span className="text-primary-500 font-medium bg-primary-50 px-2 py-0.5 rounded-full text-xs">-20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
          const isCurrent = profile?.plan === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-8 relative flex flex-col bg-white transition-all duration-200 ${
                plan.popular
                  ? "border-primary-500 shadow-xl shadow-primary-500/10 md:scale-105"
                  : "border-stone-200 hover:border-primary-200 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs px-4 py-1 rounded-full font-medium">
                  Recommandé
                </div>
              )}
              <h3 className="font-semibold text-lg text-stone-950">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-stone-950">{price}€</span>
                <span className="text-stone-500 text-sm">/mois</span>
                {annual && (
                  <p className="text-xs text-stone-400 mt-1">
                    Soit {price * 12}€/an <span className="line-through">{plan.monthlyPrice * 12}€</span>
                  </p>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-stone-700">
                    <svg className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="text-center py-3 rounded-lg text-sm font-medium bg-stone-100 text-stone-500">
                  Plan actuel
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading || loadingPlan !== null}
                  className={`block w-full text-center py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                      : "border border-stone-300 text-stone-700 hover:border-primary-500 hover:text-primary-500"
                  }`}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirection...
                    </span>
                  ) : (
                    `Choisir ${plan.name}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-stone-950 text-center mb-8 font-serif">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre espace de gestion Stripe." },
            { q: "Que se passe-t-il après l'essai gratuit ?", a: "Après 7 jours, vous devrez choisir un plan pour continuer à utiliser Louvi. Vos données sont conservées." },
            { q: "Y a-t-il un engagement ?", a: "Non, aucun engagement. Vous pouvez annuler à tout moment, que ce soit en mensuel ou en annuel." },
            { q: "Comment fonctionne le paiement ?", a: "Le paiement est sécurisé par Stripe. Vous pouvez payer par carte bancaire (Visa, Mastercard, etc.). Vos informations bancaires ne transitent jamais par nos serveurs." },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-medium text-stone-950 text-sm">{item.q}</h3>
              <p className="text-sm text-stone-600 mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-stone-500 mt-10 mb-4">
        Une question ? Contactez-nous à{" "}
        <a href="mailto:contact@getlouvi.com" className="text-primary-500 hover:underline font-medium">
          contact@getlouvi.com
        </a>
      </p>
    </div>
  );
}
