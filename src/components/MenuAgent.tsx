'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const modules = [
  { href: '/espace-agent', label: 'Accueil' },
  { href: '/espace-agent/presences', label: 'Mes présences' },
  { href: '/espace-agent/rapport', label: 'Mon rapport' },
  { href: '/espace-agent/carte', label: 'Ma carte' }
];

export default function MenuAgent() {
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
