import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-500 font-serif">Louvi</Link>
          <Link href="/" className="text-sm text-stone-600 hover:text-stone-950">Retour au site</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-950 font-serif mb-8">Mentions légales</h1>

        <div className="prose prose-stone prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-stone-950">1. Éditeur du site</h2>
            <p className="text-stone-700 leading-relaxed">
              Le site <strong>getlouvi.com</strong> (ci-après &quot;le Site&quot;) est édité par :<br /><br />
              <strong>Louvi</strong><br />
              Micro-entreprise / Entreprise individuelle<br />
              Email : <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a><br />
              Directeur de la publication : Bilal El Mestari
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">2. Hébergement</h2>
            <p className="text-stone-700 leading-relaxed">
              Le Site est hébergé par :<br /><br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              Site web : vercel.com
            </p>
            <p className="text-stone-700 leading-relaxed">
              Les données sont stockées par :<br /><br />
              <strong>Supabase Inc.</strong><br />
              970 Toa Payoh North #07-04, Singapour 318992<br />
              Site web : supabase.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">3. Propriété intellectuelle</h2>
            <p className="text-stone-700 leading-relaxed">
              L&apos;ensemble du contenu du Site (textes, images, graphismes, logo, icônes, logiciels, etc.) est la propriété exclusive de Louvi ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du Site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans l&apos;autorisation écrite préalable de Louvi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">4. Données personnelles</h2>
            <p className="text-stone-700 leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation et de portabilité de vos données personnelles.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Pour plus d&apos;informations sur le traitement de vos données, consultez notre{" "}
              <Link href="/confidentialite" className="text-primary-500 hover:underline">politique de confidentialité</Link>.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Pour exercer vos droits, contactez-nous à :{" "}
              <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">5. Cookies</h2>
            <p className="text-stone-700 leading-relaxed">
              Le Site utilise des cookies strictement nécessaires au fonctionnement du service (authentification, session utilisateur). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">6. Limitation de responsabilité</h2>
            <p className="text-stone-700 leading-relaxed">
              Louvi s&apos;efforce de fournir des informations aussi précises que possible sur le Site. Toutefois, Louvi ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Louvi ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur lors de l&apos;accès au Site, résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">7. Droit applicable</h2>
            <p className="text-stone-700 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront compétents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-950">8. Contact</h2>
            <p className="text-stone-700 leading-relaxed">
              Pour toute question relative au Site, vous pouvez nous contacter à :{" "}
              <a href="mailto:contact@getlouvi.com" className="text-primary-500">contact@getlouvi.com</a>
            </p>
          </section>
        </div>

        <p className="text-xs text-stone-400 mt-12">Dernière mise à jour : 26 mars 2026</p>
      </div>
    </div>
  );
}
