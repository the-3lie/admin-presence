import Link from 'next/link';

const cartes = [
  { href: '/personnel', titre: 'Gestion Personnel', desc: 'Ajouter, modifier et rechercher les agents.' },
  { href: '/cartes', titre: 'Cartes Présence', desc: 'Générer les badges QR et les envoyer aux agents.' },
  { href: '/scanner', titre: 'Scanner Carte', desc: 'Scanner un badge pour enregistrer un pointage.' },
  { href: '/presences', titre: 'Gestion Présences', desc: 'Historique des pointages et calcul d\'effectif.' },
  { href: '/rapport', titre: 'Rapport', desc: 'Rapport de présence par département et par période.' }
];

export default function AccueilPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Menu principal</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cartes.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-[#DCD6C7] rounded-2xl p-5 hover:border-ink transition"
          >
            <h3 className="font-bold mb-1">{c.titre}</h3>
            <p className="text-sm text-[#5B6472]">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
