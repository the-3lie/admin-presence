'use client';

import { useEffect, useState } from 'react';
import { rechercherAgents } from '@/actions/personnel';
import PersonnelForm from '@/components/PersonnelForm';

export default function PersonnelPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [terme, setTerme] = useState('');
  const [selection, setSelection] = useState<any | null>(null);

  async function charger() {
    const res = await rechercherAgents(terme);
    setAgents(res);
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
      <PersonnelForm
        agentSelectionne={selection}
        onSauvegarde={() => {
          setSelection(null);
          charger();
        }}
      />

      <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
        <div className="flex gap-2 mb-4">
          <input
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            placeholder="Rechercher par matricule, nom, postnom ou prénom"
            className="flex-1 border border-[#DCD6C7] rounded-lg px-3 py-2"
          />
          <button onClick={charger} className="px-4 rounded-lg bg-ink text-paper font-semibold">
            RechercheR
          </button>
          <button
            onClick={() => {
              setTerme('');
              setSelection(null);
              rechercherAgents('').then(setAgents);
            }}
            className="px-4 rounded-lg border border-[#DCD6C7] font-semibold"
          >
            Afficher tout
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[#5B6472] border-b-2 border-ink">
              <th className="py-2">Matricule</th>
              <th>Nom</th>
              <th>Postnom</th>
              <th>Prénom</th>
              <th>Sexe</th>
              <th>Département</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr
                key={a.id}
                onClick={() => setSelection(a)}
                className={`cursor-pointer border-b border-[#DCD6C7] hover:bg-[#EDE9DE] ${
                  selection?.id === a.id ? 'bg-[#EDE9DE]' : ''
                }`}
              >
                <td className="py-2 font-mono">{a.matricule}</td>
                <td>{a.nom}</td>
                <td>{a.postnom}</td>
                <td>{a.prenom}</td>
                <td>{a.sexe === 'MASCULIN' ? 'Masculin' : 'Féminin'}</td>
                <td>{a.departement}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {agents.length === 0 && (
          <p className="text-center text-sm text-[#5B6472] py-8">Aucun agent trouvé.</p>
        )}
      </div>
    </div>
  );
}
