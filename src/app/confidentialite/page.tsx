import Link from "next/link";
import Logo from "@/components/Logo";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo size={28} /></Link>
          <Link href="/" className="text-sm text-stone-600 hover:text-stone-950">Retour au site</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-950 font-serif mb-8">Politique de confidentialité</h1>

        <div className="prose prose-stone prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-stone-950">1. Introduction</h2>
            <p className="text-stone-700 leading-relaxed">
              La présente politique de confidentialité décrit comment <strong>Louvi</strong> (accessible via getlouvi.com) collecte, utilise et protège vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">2. Responsable du traitement</h2>
            <p className="text-stone-700 leading-relaxed">
              Le responsable du traitement des données est :<br /><br />
              <strong>Louvi — Bilal El Mestari</strong><br />
              Email : <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">3. Données collectées</h2>
            <p className="text-stone-700 leading-relaxed">Nous collectons les catégories de données suivantes :</p>

            <h3 className="text-base font-medium text-stone-900 mt-4">3.1. Utilisateurs inscrits (nos clients)</h3>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li>Adresse email</li>
              <li>Nom de l&apos;entreprise</li>
              <li>Mot de passe (hashé et sécurisé)</li>
              <li>Plan d&apos;abonnement et données de facturation (via Stripe)</li>
              <li>Date d&apos;inscription</li>
            </ul>

            <h3 className="text-base font-medium text-stone-900 mt-4">3.2. Auteurs de témoignages (clients de nos clients)</h3>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li>Prénom et nom</li>
              <li>Rôle / poste (optionnel)</li>
              <li>Nom de l&apos;entreprise (optionnel)</li>
              <li>Photo de profil (optionnel)</li>
              <li>Note (1 à 5 étoiles)</li>
              <li>Contenu du témoignage</li>
              <li>Consentement RGPD (case cochée)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">4. Finalités du traitement</h2>
            <p className="text-stone-700 leading-relaxed">Vos données sont collectées pour les finalités suivantes :</p>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Gestion des comptes</strong> : création, authentification et gestion de votre espace utilisateur</li>
              <li><strong>Fourniture du service</strong> : collecte, modération et affichage de témoignages clients</li>
              <li><strong>Facturation</strong> : gestion des abonnements et paiements via Stripe</li>
              <li><strong>Communication</strong> : réponse à vos demandes de support</li>
              <li><strong>Amélioration du service</strong> : statistiques d&apos;utilisation anonymisées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">5. Base légale du traitement</h2>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Exécution du contrat</strong> (Art. 6.1.b RGPD) : le traitement est nécessaire à la fourniture du service Louvi</li>
              <li><strong>Consentement</strong> (Art. 6.1.a RGPD) : les auteurs de témoignages donnent leur consentement explicite via la case RGPD avant soumission</li>
              <li><strong>Intérêt légitime</strong> (Art. 6.1.f RGPD) : amélioration du service et sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">6. Durée de conservation</h2>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Données des utilisateurs inscrits</strong> : conservées pendant toute la durée du compte, puis supprimées 30 jours après la clôture du compte</li>
              <li><strong>Témoignages</strong> : conservés tant que l&apos;utilisateur qui les a collectés maintient son compte actif</li>
              <li><strong>Données de facturation</strong> : conservées pendant 10 ans conformément aux obligations comptables françaises</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">7. Destinataires des données</h2>
            <p className="text-stone-700 leading-relaxed">Vos données peuvent être transmises aux sous-traitants suivants :</p>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Supabase Inc.</strong> : hébergement de la base de données et authentification</li>
              <li><strong>Vercel Inc.</strong> : hébergement du site web</li>
              <li><strong>Stripe Inc.</strong> : traitement des paiements (certifié PCI-DSS)</li>
            </ul>
            <p className="text-stone-700 leading-relaxed mt-2">
              Ces sous-traitants sont situés aux États-Unis et à Singapour. Les transferts de données hors UE sont encadrés par les clauses contractuelles types de la Commission européenne (Art. 46.2.c RGPD).
            </p>
            <p className="text-stone-700 leading-relaxed">
              Nous ne vendons jamais vos données à des tiers. Aucune donnée n&apos;est utilisée à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">8. Vos droits</h2>
            <p className="text-stone-700 leading-relaxed">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Droit d&apos;accès</strong> (Art. 15 RGPD) : obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> (Art. 16 RGPD) : corriger des données inexactes</li>
              <li><strong>Droit à l&apos;effacement</strong> (Art. 17 RGPD) : demander la suppression de vos données</li>
              <li><strong>Droit à la limitation</strong> (Art. 18 RGPD) : limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> (Art. 20 RGPD) : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition</strong> (Art. 21 RGPD) : vous opposer au traitement de vos données</li>
              <li><strong>Droit de retrait du consentement</strong> : retirer votre consentement à tout moment</li>
            </ul>
            <p className="text-stone-700 leading-relaxed mt-2">
              Pour exercer ces droits, envoyez un email à{" "}
              <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a>.
              Nous répondrons dans un délai de 30 jours.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) : cnil.fr
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">9. Sécurité</h2>
            <p className="text-stone-700 leading-relaxed">
              Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des mots de passe (hashage bcrypt)</li>
              <li>Contrôle d&apos;accès par Row Level Security (RLS) sur la base de données</li>
              <li>Paiements sécurisés via Stripe (certifié PCI-DSS niveau 1)</li>
              <li>Authentification sécurisée via Supabase Auth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">10. Cookies</h2>
            <p className="text-stone-700 leading-relaxed">
              Le Site utilise uniquement des <strong>cookies strictement nécessaires</strong> au fonctionnement du service :
            </p>
            <ul className="list-disc pl-5 text-stone-700 space-y-1">
              <li><strong>Cookies d&apos;authentification</strong> : maintien de la session utilisateur (Supabase Auth)</li>
            </ul>
            <p className="text-stone-700 leading-relaxed mt-2">
              Aucun cookie publicitaire, analytique ou de suivi tiers n&apos;est utilisé. Conformément à la directive ePrivacy, les cookies strictement nécessaires ne requièrent pas de consentement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">11. Modifications</h2>
            <p className="text-stone-700 leading-relaxed">
              Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec la date de mise à jour. Nous vous encourageons à consulter cette page régulièrement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">12. Contact</h2>
            <p className="text-stone-700 leading-relaxed">
              Pour toute question relative à cette politique de confidentialité ou à vos données personnelles :<br /><br />
              <strong>Louvi — Bilal El Mestari</strong><br />
              Email : <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a>
            </p>
          </section>
        </div>

        <p className="text-xs text-stone-400 mt-12">Dernière mise à jour : 26 mars 2026</p>
      </div>
    </div>
  );
}
