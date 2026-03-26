"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import StarRating from "@/components/StarRating";
import AnimatedSection from "@/components/AnimatedSection";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Formulaire personnalisé",
    description: "Créez un formulaire de collecte en quelques clics et partagez le lien avec vos clients.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Modération facile",
    description: "Approuvez ou refusez chaque témoignage avant qu'il ne soit publié sur votre site.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    title: "Widgets intégrables",
    description: "Choisissez parmi 4 styles de widgets et intégrez-les à votre site en un copier-coller.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Wall of Love",
    description: "Affichez tous vos témoignages approuvés dans une mosaïque élégante et partageable.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    title: "Notes & étoiles",
    description: "Collectez des notes de 1 à 5 étoiles pour quantifier la satisfaction de vos clients.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Tableau de bord",
    description: "Suivez vos statistiques en temps réel : total, approuvés, en attente, note moyenne.",
  },
];

const steps = [
  {
    number: "1",
    title: "Créez votre formulaire",
    description: "Personnalisez votre formulaire de collecte en quelques clics. Partagez le lien avec vos clients par email, SMS ou QR code.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Modérez les avis",
    description: "Recevez les témoignages dans votre tableau de bord. Approuvez, refusez ou organisez-les par tags en un clic.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Affichez-les sur votre site",
    description: "Copiez un simple code embed et intégrez vos témoignages sur votre site. Grille, carrousel, liste ou badge — à vous de choisir.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
];

// Exemple de Wall of Love — comme si c'était les avis d'une vraie entreprise
const demoTestimonials = [
  { name: "Claire M.", role: "Cliente fidèle", rating: 5, content: "Les croissants sont incroyables, on dirait ceux de mon enfance. Je viens chaque dimanche matin avec ma famille. Le personnel est toujours souriant !" },
  { name: "Julien R.", role: "", rating: 5, content: "J'ai commandé un gâteau d'anniversaire personnalisé et il était magnifique. Le goût était à la hauteur de la présentation. Merci !" },
  { name: "Nadia B.", role: "Foodie", rating: 4, content: "Très bonne boulangerie de quartier. Le pain au levain est excellent. Seul bémol : il faut arriver tôt le samedi sinon il n'y en a plus." },
  { name: "Marc D.", role: "", rating: 5, content: "Meilleure pâtisserie de Lyon. Les éclairs au chocolat sont une tuerie. Je recommande les yeux fermés." },
  { name: "Sophie L.", role: "Organisatrice d'événements", rating: 5, content: "On fait appel à eux pour tous nos événements professionnels. La qualité est constante et le service impeccable." },
  { name: "Antoine P.", role: "", rating: 4, content: "Bon rapport qualité-prix. J'apprécie particulièrement leurs viennoiseries le matin. Livraison rapide aussi." },
];

const plans = [
  {
    name: "Starter",
    monthlyPrice: 19,
    features: ["50 témoignages", "1 formulaire de collecte", "Wall of Love", "2 styles de widgets", "Support par email"],
    cta: "Commencer",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 39,
    features: ["500 témoignages", "Formulaires illimités", "Wall of Love", "4 styles de widgets", "Thème clair & sombre", "Widget badge", "Support prioritaire"],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Business",
    monthlyPrice: 99,
    features: ["Témoignages illimités", "Formulaires illimités", "Tous les widgets", "Domaine personnalisé (bientôt)", "API access (bientôt)", "Support dédié", "Analytics avancés (bientôt)"],
    cta: "Contacter l'équipe",
    popular: false,
  },
];

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-500 font-serif">
            Louvi
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-stone-600 hover:text-stone-950 transition-colors duration-200 text-sm">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-stone-600 hover:text-stone-950 transition-colors duration-200 text-sm">
              Tarifs
            </a>
            <Link href="/login" className="text-stone-600 hover:text-stone-950 transition-colors duration-200 text-sm">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="gradient-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200"
            >
              Essai gratuit 7 jours
            </Link>
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-stone-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenu ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-stone-200 bg-white px-6 py-4 space-y-3">
            <a href="#fonctionnalites" className="block text-stone-600 text-sm" onClick={() => setMobileMenu(false)}>Fonctionnalités</a>
            <a href="#tarifs" className="block text-stone-600 text-sm" onClick={() => setMobileMenu(false)}>Tarifs</a>
            <Link href="/login" className="block text-stone-600 text-sm">Connexion</Link>
            <Link href="/signup" className="block gradient-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium text-center">
              Essai gratuit 7 jours
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              La preuve sociale qui convertit
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-stone-950 leading-tight">
              Vos clients satisfaits sont votre meilleur argument de vente
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto">
              Collectez, gérez et affichez les témoignages de vos clients en quelques
              minutes. Transformez la satisfaction en preuve sociale.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(heroEmail ? `/signup?email=${encodeURIComponent(heroEmail)}` : "/signup");
              }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full sm:w-80 px-5 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto gradient-primary text-white px-8 py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200 text-center"
              >
                Essai gratuit 7 jours
              </button>
            </form>
            <p className="mt-4 text-xs text-stone-400">
              7 jours d&apos;essai gratuit · Aucune carte bancaire requise
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Trust Bar — Plateformes compatibles */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <p className="text-center text-sm text-stone-500 mb-5 font-medium">
                S&apos;installe en 2 minutes sur vos plateformes préférées
              </p>
              <p className="text-center text-xs text-stone-400 mb-4">
                Compatible avec tous les sites — il suffit de coller un code embed
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-stone-400">
                <span className="text-sm font-semibold tracking-wide">Shopify</span>
                <span className="text-sm font-semibold tracking-wide">WordPress</span>
                <span className="text-sm font-semibold tracking-wide">Wix</span>
                <span className="text-sm font-semibold tracking-wide">Webflow</span>
                <span className="text-sm font-semibold tracking-wide">Framer</span>
                <span className="text-sm font-semibold tracking-wide">Squarespace</span>
                <span className="text-sm font-semibold tracking-wide">HTML</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-stone-950 mb-4">
              Tout ce qu&apos;il vous faut
            </h2>
            <p className="text-center text-stone-600 mb-14 max-w-xl mx-auto">
              Des outils puissants pour collecter et mettre en valeur les retours de vos clients.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 100}>
                <div className="p-6 rounded-xl border border-stone-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-stone-950 mb-2">{f.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{f.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-stone-950 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-center text-stone-600 mb-14 max-w-xl mx-auto">
              En 3 étapes simples, collectez et affichez vos témoignages clients.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 120}>
                <div className="relative bg-white rounded-2xl border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-500 mb-5">
                    {step.icon}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-400">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-stone-950 mb-3">{step.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Love — Exemple */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-4">
              <span className="inline-block bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-medium mb-4">
                Exemple de rendu
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-950 mb-4">
                Voici à quoi ressemble un Wall of Love
              </h2>
              <p className="text-stone-600 max-w-2xl mx-auto">
                Cet exemple montre comment une boulangerie pourrait afficher les avis de ses clients grâce à Louvi.
              </p>
            </div>
          </AnimatedSection>
          <div className="mt-12 bg-stone-900 rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoTestimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 80}>
                  <div className="bg-stone-800 rounded-xl border border-stone-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={t.name} size="sm" />
                      <div>
                        <p className="font-semibold text-white text-sm">{t.name}</p>
                        {t.role && <p className="text-xs text-stone-400">{t.role}</p>}
                      </div>
                    </div>
                    <StarRating rating={t.rating} size="sm" />
                    <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <p className="text-center text-xs text-stone-500 mt-6">
              Widget carrousel sombre — un des 4 styles disponibles
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-stone-950 mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-center text-stone-600 mb-8">
              Choisissez le plan adapté à vos besoins.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mb-14">
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
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const price = annual
                ? Math.round(plan.monthlyPrice * 0.8)
                : plan.monthlyPrice;

              return (
                <AnimatedSection key={plan.name} delay={i * 150}>
                  <div
                    className={`rounded-xl border p-8 relative h-full flex flex-col ${
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
                      href="/signup"
                      className={`block text-center py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        plan.popular
                          ? "gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                          : "border border-stone-300 text-stone-700 hover:border-primary-500 hover:text-primary-500"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-12 shadow-2xl shadow-primary-500/20">
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Prêt à transformer vos avis en conversions ?
            </h2>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">
              Rejoignez des centaines d&apos;entreprises qui utilisent Louvi pour renforcer leur crédibilité en ligne.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors duration-200 shadow-lg"
            >
              Essai gratuit 7 jours
            </Link>
            <p className="text-primary-200 text-xs mt-3">Aucune carte bancaire requise</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-bold text-primary-500 font-serif">Louvi</div>
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Louvi. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-stone-500">
            <Link href="/mentions-legales" className="hover:text-stone-700 transition-colors duration-200">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-stone-700 transition-colors duration-200">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
