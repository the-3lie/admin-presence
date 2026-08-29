'use client';

import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    const form = new FormData(e.currentTarget);

    const res = await signIn('credentials', {
      username: form.get('username'),
      password: form.get('password'),
      redirect: false
    });

    setChargement(false);
    if (res?.error) {
      setErreur('Identifiant ou mot de passe incorrect');
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;
    router.push(role === 'AGENT' ? '/espace-agent' : '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm bg-white border border-[#DCD6C7] rounded-2xl p-8">
        <p className="text-xs uppercase tracking-widest text-[#C6842A] font-semibold mb-1">
          Pointage numérique
        </p>
        <h1 className="text-2xl font-bold mb-6">Gestion des Présences</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#5B6472] mb-1">Nom d'utilisateur</label>
            <input
              name="username"
              required
              className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-[#5B6472] mb-1">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2"
            />
          </div>

          {erreur && <p className="text-sm text-clay">{erreur}</p>}

          <button
            disabled={chargement}
            className="w-full bg-ink text-paper rounded-lg py-2.5 font-semibold disabled:opacity-50"
          >
            {chargement ? 'Connexion…' : 'Connexion'}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link href="/creer-compte-agent" className="text-[#5B6472] hover:text-ink">
            Espace agent · créer mon compte
          </Link>
          <Link href="/mot-de-passe-oublie" className="text-[#5B6472] hover:text-ink">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="mt-2 text-sm">
          <Link href="/creer-compte" className="text-[#5B6472] hover:text-ink">
            Créer un compte administrateur
          </Link>
        </div>
      </div>
    </div>
  );
}
