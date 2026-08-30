'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ScannerCamera from '@/components/ScannerCamera';
import { rechercherAgents } from '@/actions/personnel';
import { enregistrerScan } from '@/actions/presences';

export default function ScanPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#1B2430]" />;
  }

  if (!session) {
    return <ConnexionScanner />;
  }

  const role = (session.user as any)?.role;
  if (role === 'AGENT') {
    return (
      <div className="min-h-screen bg-[#1B2430] flex items-center justify-center px-6 text-center">
        <p className="text-[#F7F5F0]">Ce module est réservé aux administrateurs et superviseurs.</p>
      </div>
    );
  }

  return <ScannerEcran />;
}

function ConnexionScanner() {
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
    if (res?.error) setErreur('Identifiant ou mot de passe incorrect');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B2430] px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-widest text-[#D9A441] font-semibold mb-1 text-center">
          Pointage numérique
        </p>
        <h1 className="text-2xl font-bold text-[#F7F5F0] text-center mb-8">Scanner de présence</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            name="username"
            required
            placeholder="Nom d'utilisateur"
            className="w-full bg-[#2A3547] text-[#F7F5F0] placeholder:text-[#8A94A6] rounded-xl px-4 py-3.5"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Mot de passe"
            className="w-full bg-[#2A3547] text-[#F7F5F0] placeholder:text-[#8A94A6] rounded-xl px-4 py-3.5"
          />
          {erreur && <p className="text-[#E07856] text-sm">{erreur}</p>}
          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-[#D9A441] text-[#1B2430] font-bold rounded-xl py-3.5 mt-2"
          >
            {chargement ? '...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ScannerEcran() {
  const [agents, setAgents] = useState<any[]>([]);
  const [choix, setChoix] = useState('');
  const [message, setMessage] = useState('');
  const [manuel, setManuel] = useState(false);

  useEffect(() => {
    rechercherAgents('').then(setAgents);
  }, []);

  async function pointageManuel() {
    const agent = agents.find((a) => a.id === choix);
    if (!agent || !agent.qrToken) {
      setMessage("Cet agent n'a pas encore de badge généré (module Cartes Présence).");
      return;
    }
    const res = await enregistrerScan(agent.qrToken);
    setMessage(res.success ? `Pointage enregistré pour ${res.agentNom}.` : res.message || 'Erreur');
  }

  return (
    <div className="min-h-screen bg-[#1B2430] px-4 pt-14 pb-8">
      <div className="flex items-center justify-between mb-6 max-w-sm mx-auto">
        <h1 className="text-[#F7F5F0] font-bold text-lg">Scanner de présence</h1>
        <button onClick={() => signOut({ redirect: false })} className="text-[#D9A441] text-xs font-semibold">
          Déconnexion
        </button>
      </div>

      {!manuel ? (
        <>
          <ScannerCamera />
          <button
            onClick={() => setManuel(true)}
            className="block mx-auto mt-6 text-[#8A94A6] text-xs font-semibold"
          >
            Pointage manuel (sans caméra)
          </button>
        </>
      ) : (
        <div className="max-w-sm mx-auto bg-[#2A3547] rounded-2xl p-5">
          <select
            value={choix}
            onChange={(e) => setChoix(e.target.value)}
            className="w-full bg-[#1B2430] text-[#F7F5F0] rounded-lg px-3 py-2.5 mb-3"
          >
            <option value="">— Choisir un agent —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.prenom} {a.nom} ({a.matricule})
              </option>
            ))}
          </select>
          <button onClick={pointageManuel} className="w-full bg-[#D9A441] text-[#1B2430] font-bold rounded-lg py-2.5">
            Enregistrer le pointage
          </button>
          {message && <p className="text-[#8A94A6] text-sm mt-3">{message}</p>}
          <button onClick={() => setManuel(false)} className="block mx-auto mt-4 text-[#8A94A6] text-xs font-semibold">
            Retour au scanner caméra
          </button>
        </div>
      )}
    </div>
  );
}
