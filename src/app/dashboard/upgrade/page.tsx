"use client";

import { useState } from "react";
import Link from "next/link";

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
    features: ["Témoignages illimités", "Formulaires illimités", "Tous les widgets", "Domaine personnalisé", "API access", "Support dédié", "Analytics avancés"],
    popular: false,
  },
];

export default function UpgradePage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Votre essai gratuit a expiré
        </div>
        <h1 className="text-3xl font-bold text-stone-950 font-serif">
          Choisissez votre plan
        </h1>
        <p className="mt-3 text-stone-600">
          Continuez à collecter et afficher vos témoignages clients.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm ${!annual ? "text-stone-950 font-medium" : "text-stone-500"}`}>
          Mensuel
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
            annual ? "bg-primary-500" : "bg-stone-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
              annual ? "translate-x-7" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "text-stone-950 font-medium" : "text-stone-500"}`}>
          Annuel{" "}
          <span className="text-primary-500 font-medium bg-primary-50 px-2 py-0.5 rounded-full text-xs">
            -20%
          </span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-8 relative flex flex-col bg-white ${
                plan.popular
                  ? "border-primary-500 shadow-xl shadow-primary-500/10 scale-105"
                  : "border-stone-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs px-4 py-1 rounded-full font-medium">
                  Populaire
                </div>
              )}
              <h3 className="font-semibold text-lg text-stone-950">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-stone-950">{price}€</span>
                <span className="text-stone-500 text-sm">/mois</span>
                {annual && (
                  <p className="text-xs text-stone-400 mt-1">
                    soit {price * 12}€/an au lieu de {plan.monthlyPrice * 12}€
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
              <Link
                href={`mailto:contact@getlouvi.com?subject=Abonnement ${plan.name}&body=Je souhaite souscrire au plan ${plan.name} (${price}€/mois).`}
                className={`block text-center py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  plan.popular
                    ? "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                    : "border border-stone-300 text-stone-700 hover:border-primary-500 hover:text-primary-500"
                }`}
              >
                Choisir {plan.name}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-stone-500 mt-8">
        Une question ?{" "}
        <a href="mailto:contact@getlouvi.com" className="text-primary-500 hover:underline">
          Contactez-nous
        </a>
      </p>
    </div>
  );
}
