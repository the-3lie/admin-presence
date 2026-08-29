'use client';

import { useEffect, useState } from 'react';
import { rechercherPresences, calculerEffectif } from '@/actions/presences';
import { rechercherAgents } from '@/actions/personnel';

export default function PresencesPage() {
  const [presences, setPresences] = useState<any[]>([]);
  const [matricule, setMatricule] = useState('');
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');

  const [agents, setAgents] = useState<any[]>([]);
  const [agentEffectif, setAgentEffectif] = useState('');
  const [mois, setMois] = useState(() => new Date().toISOString().slice(0, 7));
  const [effectif, setEffectif] = useState<{ joursOuvrables: number; nbPresences: number; nbAbsences: number } | null>(null);

  async function rechercher() {
    setPresences(await rechercherPresences({ matricule, du, au }));
  }

  useEffect(() => {
    rechercher();
    rechercherAgents('').then(setAgents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCalculer() {
    if (!agentEffectif || !mois) return;
    const [annee, m] = mois.split('-').map(Number);
    setEffectif(await calculerEffectif(agentEffectif, annee, m - 1));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="block text-xs text-[#5B6472] mb-1">Rechercher par matricule</label>
            <input value={matricule} onChange={(e) => setMatricule(e.target.value)} className="border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-[#5B6472] mb-1">Période du</label>
            <input type="date" value={du} onChange={(e) => setDu(e.target.value)} className="border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-[#5B6472] mb-1">Au</label>
            <input type="date" value={au} onChange={(e) => setAu(e.target.value)} className="border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>
          <button onClick={rechercher} className="px-4 py-2 rounded-lg bg-ink text-paper font-semibold">
            Rechercher
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[#5B6472] border-b-2 border-ink">
              <th className="py-2">ID Présence</th>
              <th>Date</th>
              <th>Heure d'arrivée</th>
              <th>Heure de départ</th>
              <th>Personnel</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {presences.map((p) => (
              <tr key={p.id} className="border-b border-[#DCD6C7]">
                <td className="py-2 font-mono">{p.id}</td>
                <td>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                <td className="font-mono">{p.heureArrivee ? new Date(p.heureArrivee).toLocaleTimeString('fr-FR') : '—'}</td>
                <td className="font-mono">{p.heureDepart ? new Date(p.heureDepart).toLocaleTimeString('fr-FR') : 'PAS ENCORE'}</td>
                <td>{p.personnel.prenom} {p.personnel.nom}</td>
                <td>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      p.statut === 'PRESENT' ? 'bg-[#E7F1EA] text-green' : 'bg-[#EDE9DE] text-[#5B6472]'
                    }`}
                  >
                    {p.statut === 'PRESENT' ? 'PRESENT' : 'PAS ENCORE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {presences.length === 0 && <p className="text-center text-sm text-[#5B6472] py-8">Aucun pointage trouvé.</p>}
      </div>

      <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5 max-w-lg">
        <h3 className="font-bold mb-3">Calculer effectif</h3>
        <div className="flex flex-wrap gap-3 items-end mb-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-[#5B6472] mb-1">Agent</label>
            <select value={agentEffectif} onChange={(e) => setAgentEffectif(e.target.value)} className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2">
              <option value="">— Choisir —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom} ({a.matricule})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#5B6472] mb-1">Mois</label>
            <input type="month" value={mois} onChange={(e) => setMois(e.target.value)} className="border border-[#DCD6C7] rounded-lg px-3 py-2" />
          </div>
          <button onClick={onCalculer} className="px-4 py-2 rounded-lg bg-ink text-paper font-semibold">
            Calculer
          </button>
        </div>

        {effectif && (
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div>
              <p className="text-xl font-bold">{effectif.joursOuvrables}</p>
              <p className="text-xs text-[#5B6472]">Jours ouvrables</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green">{effectif.nbPresences}</p>
              <p className="text-xs text-[#5B6472]">Présences</p>
            </div>
            <div>
              <p className="text-xl font-bold text-clay">{effectif.nbAbsences}</p>
              <p className="text-xs text-[#5B6472]">Absences</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
