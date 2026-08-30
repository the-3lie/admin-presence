'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { creerCompteAgent } from '@/actions/auth';
import { monProfil, mesPresences, monEffectifMensuel, maCarte } from '@/actions/agent';

export default function AgentPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#F7F5F0]" />;
  }

  if (!session) return <ConnexionAgent />;

  const role = (session.user as any)?.role;
  if (role !== 'AGENT') {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-6 text-center">
        <p className="text-[#1B2430]">Ce module est réservé aux comptes agent.</p>
      </div>
    );
  }

  return <EspaceAgentShell />;
}

function ConnexionAgent() {
  const [mode, setMode] = useState<'connexion' | 'creation'>('connexion');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function onSubmitConnexion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      username: form.get('matricule'),
      password: form.get('password'),
      redirect: false
    });
    setChargement(false);
    if (res?.error) setErreur('Identifiant ou mot de passe incorrect');
  }

  async function onSubmitCreation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    const form = new FormData(e.currentTarget);
    if (form.get('password') !== form.get('confirmation')) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    setChargement(true);
    const res = await creerCompteAgent(form);
    setChargement(false);
    if (!res.success) {
      setErreur(res.message || 'Erreur lors de la création du compte');
      return;
    }
    // Compte créé : connecte directement avec les identifiants saisis.
    await signIn('credentials', {
      username: form.get('matricule'),
      password: form.get('password'),
      redirect: false
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-widest text-[#D9A441] font-semibold mb-1 text-center">
          Pointage numérique
        </p>
        <h1 className="text-2xl font-bold text-[#1B2430] text-center mb-2">Espace Agent</h1>
        <p className="text-sm text-[#5B6472] text-center mb-8">
          {mode === 'connexion' ? 'Connectez-vous avec votre matricule.' : 'Créez votre compte avec votre matricule.'}
        </p>

        {mode === 'connexion' ? (
          <form onSubmit={onSubmitConnexion} className="space-y-3">
            <input name="matricule" required placeholder="Matricule" className="champ-agent" />
            <input name="password" type="password" required placeholder="Mot de passe" className="champ-agent" />
            {erreur && <p className="text-[#E07856] text-sm">{erreur}</p>}
            <button disabled={chargement} className="bouton-agent">
              {chargement ? '...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitCreation} className="space-y-3">
            <input name="matricule" required placeholder="Matricule" className="champ-agent" />
            <input name="password" type="password" required placeholder="Mot de passe" className="champ-agent" />
            <input name="confirmation" type="password" required placeholder="Confirmer le mot de passe" className="champ-agent" />
            {erreur && <p className="text-[#E07856] text-sm">{erreur}</p>}
            <button disabled={chargement} className="bouton-agent">
              {chargement ? '...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        <button
          onClick={() => setMode(mode === 'connexion' ? 'creation' : 'connexion')}
          className="block mx-auto mt-6 text-[#5B6472] text-xs font-semibold"
        >
          {mode === 'connexion' ? "Pas encore de compte ? Créer un compte" : 'Déjà un compte ? Se connecter'}
        </button>

        <style jsx global>{`
          .champ-agent {
            width: 100%;
            background: #fff;
            border: 1px solid #dcd6c7;
            border-radius: 12px;
            padding: 14px 16px;
            font-size: 15px;
            color: #1b2430;
          }
          .bouton-agent {
            width: 100%;
            background: #d9a441;
            color: #1b2430;
            font-weight: 700;
            border-radius: 12px;
            padding: 14px;
            margin-top: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}

const statutLabel: Record<string, string> = {
  PAS_ENCORE: 'Arrivée pointée — départ pas encore enregistré',
  PRESENT: 'Présent (arrivée et départ pointés)',
  ABSENT: 'Absent'
};

type Onglet = 'accueil' | 'presences' | 'rapport' | 'carte';

function EspaceAgentShell() {
  const [onglet, setOnglet] = useState<Onglet>('accueil');

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <header className="bg-[#1B2430] px-5 pt-14 pb-4 flex items-center justify-between border-b-2 border-[#D9A441]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#D9A441] font-bold">Pointage numérique</p>
          <h1 className="text-lg font-bold text-[#F7F5F0] mt-0.5">Espace Agent</h1>
        </div>
        <button onClick={() => signOut({ redirect: false })} className="text-[#F7F5F0]/80 text-xs font-semibold">
          Déconnexion
        </button>
      </header>

      <main className="flex-1 p-4">
        {onglet === 'accueil' && <OngletAccueil />}
        {onglet === 'presences' && <OngletPresences />}
        {onglet === 'rapport' && <OngletRapport />}
        {onglet === 'carte' && <OngletCarte />}
      </main>

      <nav className="flex bg-white border-t border-[#DCD6C7] pb-6 pt-2.5">
        {(
          [
            ['accueil', 'Accueil'],
            ['presences', 'Présences'],
            ['rapport', 'Rapport'],
            ['carte', 'Ma carte']
          ] as [Onglet, string][]
        ).map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)} className="flex-1 flex flex-col items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${onglet === id ? 'text-[#1B2430]' : 'text-[#8A94A6]'}`}>
              {label}
            </span>
            {onglet === id && <span className="w-4.5 h-[3px] rounded bg-[#D9A441]" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

function OngletAccueil() {
  const [agent, setAgent] = useState<any>(null);
  const [presenceDuJour, setPresenceDuJour] = useState<any>(null);
  const [effectif, setEffectif] = useState<{ joursOuvrables: number; nbPresences: number; nbAbsences: number } | null>(
    null
  );

  useEffect(() => {
    monProfil().then((r) => {
      setAgent(r.agent);
      setPresenceDuJour(r.presenceDuJour);
    });
    const now = new Date();
    monEffectifMensuel(now.getFullYear(), now.getMonth()).then(setEffectif);
  }, []);

  const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {agent && (
        <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-[#1B2430]">
            Bonjour {agent.prenom} {agent.nom}
          </h2>
          <p className="text-sm text-[#5B6472] mb-4">
            {agent.fonction} · {agent.departement} · Matricule {agent.matricule}
          </p>
          <div className="rounded-xl bg-[#F7F5F0] border border-[#DCD6C7] p-4">
            <p className="text-[11px] uppercase tracking-widest text-[#5B6472] mb-1">Aujourd&apos;hui</p>
            {presenceDuJour ? (
              <>
                <p className="font-semibold text-[#1B2430]">{statutLabel[presenceDuJour.statut]}</p>
                {presenceDuJour.heureArrivee && (
                  <p className="text-sm text-[#5B6472]">
                    Arrivée : {new Date(presenceDuJour.heureArrivee).toLocaleTimeString('fr-FR')}
                  </p>
                )}
                {presenceDuJour.heureDepart && (
                  <p className="text-sm text-[#5B6472]">
                    Départ : {new Date(presenceDuJour.heureDepart).toLocaleTimeString('fr-FR')}
                  </p>
                )}
              </>
            ) : (
              <p className="font-semibold text-[#E07856]">Aucun pointage enregistré aujourd&apos;hui</p>
            )}
          </div>
        </div>
      )}

      {effectif && (
        <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
          <h3 className="font-bold text-[#1B2430] mb-3 capitalize">Résumé du mois — {mois}</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatBox valeur={effectif.joursOuvrables} label="Jours ouvrables" />
            <StatBox valeur={effectif.nbPresences} label="Présences" couleur="#4A7C59" />
            <StatBox valeur={effectif.nbAbsences} label="Absences" couleur="#E07856" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ valeur, label, couleur }: { valeur: number; label: string; couleur?: string }) {
  return (
    <div className="rounded-xl bg-[#F7F5F0] border border-[#DCD6C7] p-3">
      <p className="text-xl font-bold" style={{ color: couleur || '#1B2430' }}>
        {valeur}
      </p>
      <p className="text-[10px] text-[#5B6472] mt-1">{label}</p>
    </div>
  );
}

function OngletPresences() {
  const [presences, setPresences] = useState<any[]>([]);
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [chargement, setChargement] = useState(true);

  async function rechercher() {
    setChargement(true);
    setPresences(await mesPresences({ du: du || undefined, au: au || undefined }));
    setChargement(false);
  }

  useEffect(() => {
    rechercher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input type="date" value={du} onChange={(e) => setDu(e.target.value)} className="flex-1 bg-white border border-[#DCD6C7] rounded-lg px-2 py-2 text-xs" />
        <input type="date" value={au} onChange={(e) => setAu(e.target.value)} className="flex-1 bg-white border border-[#DCD6C7] rounded-lg px-2 py-2 text-xs" />
        <button onClick={rechercher} className="bg-[#1B2430] text-[#F7F5F0] rounded-lg px-3 text-xs font-bold">
          Filtrer
        </button>
      </div>

      <div className="space-y-2">
        {presences.map((p) => (
          <div key={p.id} className="bg-white border border-[#DCD6C7] rounded-xl p-3.5">
            <p className="font-bold text-[#1B2430] text-sm mb-1">{new Date(p.date).toLocaleDateString('fr-FR')}</p>
            <p className="text-xs text-[#5B6472]">
              Arrivée : {p.heureArrivee ? new Date(p.heureArrivee).toLocaleTimeString('fr-FR') : '—'}
            </p>
            <p className="text-xs text-[#5B6472]">
              Départ : {p.heureDepart ? new Date(p.heureDepart).toLocaleTimeString('fr-FR') : '—'}
            </p>
            <p className="text-xs text-[#D9A441] font-bold mt-1">{statutLabel[p.statut]?.split(' ')[0] ?? p.statut}</p>
          </div>
        ))}
        {!chargement && presences.length === 0 && (
          <p className="text-center text-sm text-[#5B6472] py-10">Aucun pointage trouvé sur cette période.</p>
        )}
      </div>
    </div>
  );
}

function OngletRapport() {
  const maintenant = new Date();
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [mois, setMois] = useState(maintenant.getMonth());
  const [effectif, setEffectif] = useState<{ joursOuvrables: number; nbPresences: number; nbAbsences: number } | null>(
    null
  );

  async function calculer(a = annee, m = mois) {
    setEffectif(await monEffectifMensuel(a, m));
  }

  useEffect(() => {
    calculer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changerMois(delta: number) {
    let m = mois + delta;
    let a = annee;
    if (m < 0) {
      m = 11;
      a -= 1;
    } else if (m > 11) {
      m = 0;
      a += 1;
    }
    setMois(m);
    setAnnee(a);
    calculer(a, m);
  }

  const nomMois = new Date(annee, mois, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-center gap-5 mb-5 mt-2">
        <button onClick={() => changerMois(-1)} className="w-9 h-9 rounded-lg bg-white border border-[#DCD6C7] font-bold text-[#1B2430]">
          ‹
        </button>
        <p className="font-bold text-[#1B2430] capitalize">{nomMois}</p>
        <button onClick={() => changerMois(1)} className="w-9 h-9 rounded-lg bg-white border border-[#DCD6C7] font-bold text-[#1B2430]">
          ›
        </button>
      </div>
      {effectif && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#DCD6C7] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1B2430]">{effectif.joursOuvrables}</p>
            <p className="text-[11px] text-[#5B6472] mt-1">Jours ouvrables</p>
          </div>
          <div className="bg-white border border-[#DCD6C7] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#4A7C59]">{effectif.nbPresences}</p>
            <p className="text-[11px] text-[#5B6472] mt-1">Présences</p>
          </div>
          <div className="bg-white border border-[#DCD6C7] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#E07856]">{effectif.nbAbsences}</p>
            <p className="text-[11px] text-[#5B6472] mt-1">Absences</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OngletCarte() {
  const [carte, setCarte] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([maCarte(), monProfil()]).then(([c, p]) => {
      setCarte(c);
      setAgent(p.agent);
      setChargement(false);
    });
  }, []);

  if (chargement) return null;

  return (
    <div className="flex flex-col items-center text-center pt-6">
      {agent && (
        <>
          <p className="font-semibold text-[#1B2430]">
            {agent.prenom} {agent.nom}
          </p>
          <p className="text-sm text-[#5B6472] mb-6">Matricule {agent.matricule}</p>
        </>
      )}
      {carte ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={carte.imageDataUrl} alt="Badge QR de présence" className="w-64 h-64 border border-[#DCD6C7] rounded-2xl p-2 bg-white" />
          <p className="text-xs text-[#5B6472] mt-4">Générée le {new Date(carte.genereeLe).toLocaleDateString('fr-FR')}</p>
          <p className="text-sm text-[#5B6472] mt-2 max-w-xs">
            Présentez ce QR code au scanner à votre arrivée et à votre départ.
          </p>
        </>
      ) : (
        <p className="text-sm text-[#E07856] py-10 max-w-xs">
          Aucune carte n&apos;a encore été générée pour vous. Contactez votre administration.
        </p>
      )}
    </div>
  );
}
