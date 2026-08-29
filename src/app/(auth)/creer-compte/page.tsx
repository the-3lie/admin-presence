'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { creerCompte } from '@/actions/auth';

export default function CreerComptePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    const formData = new FormData(e.currentTarget);
    const res = await creerCompte(formData);
    setChargement(false);

    if (!res.success) {
      setMessage(res.message || 'Erreur lors de la création du compte');
      return;
    }
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm bg-white border border-[#DCD6C7] rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#5B6472] mb-1">Nom d'utilisateur</label>
            <input name="username" required className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-[#5B6472] mb-1">Mot de passe</label>
            <input name="password" type="password" required className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>

          {message && <p className="text-sm text-clay">{message}</p>}

          <button disabled={chargement} className="w-full bg-ink text-paper rounded-lg py-2.5 font-semibold disabled:opacity-50">
            {chargement ? 'Création…' : 'Créer le compte'}
          </button>
        </form>

        <Link href="/login" className="block mt-4 text-sm text-[#5B6472] hover:text-ink">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
