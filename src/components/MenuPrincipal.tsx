'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const modules = [
  { href: '/', label: 'Accueil' },
  { href: '/personnel', label: 'Gestion Personnel' },
  { href: '/cartes', label: 'Cartes Présence' },
  { href: '/presences', label: 'Gestion Présences' },
  { href: '/rapport', label: 'Rapport' }
];

export default function MenuPrincipal() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#2A3547] px-6 flex items-center gap-2 overflow-x-auto">
      {modules.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${
            pathname === m.href ? 'text-amber border-amber' : 'text-paper/80 border-transparent hover:text-paper'
          }`}
        >
          {m.label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="ml-auto px-4 py-3 text-sm font-semibold text-paper/80 hover:text-clay"
      >
        Déconnexion
      </button>
    </nav>
  );
}
