'use client';

import { useEffect, useState } from 'react';
import { rechercherAgents } from '@/actions/personnel';
import { genererCarte, listerCartes } from '@/actions/cartes';

export default function CartesPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [terme, setTerme] = useState('');
  const [selection, setSelection] = useState<any | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [historique, setHistorique] = useState<any[]>([]);
  const [chargement, setChargement] = useState(false);

  async function charger() {
    setAgents(await rechercherAgents(terme));
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choisirAgent(a: any) {
    setSelection(a);
    setBadge(null);
    setHistorique(await listerCartes(a.id));
  }

  async function onGenerer() {
    if (!selection) return;
    setChargement(true);
    const res = await genererCarte(selection.id);
    setBadge(res.imageDataUrl);
    setHistorique(await listerCartes(selection.id));
    setChargement(false);
  }

  function telecharger() {
    if (!badge || !selection) return;
    const a = document.createElement('a');
    a.href = badge;
    a.download = `badge-${selection.matricule}-${selection.nom}.png`;
    a.click();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
        <div className="flex gap-2 mb-4">
          <input
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            placeholder="Rechercher par matricule"
            className="flex-1 border border-[#DCD6C7] rounded-lg px-3 py-2"
          />
          <button onClick={charger} className="px-4 rounded-lg bg-ink text-paper font-semibold">
            Rechercher
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
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr
                key={a.id}
                onClick={() => choisirAgent(a)}
                className={`cursor-pointer border-b border-[#DCD6C7] hover:bg-[#EDE9DE] ${
                  selection?.id === a.id ? 'bg-[#EDE9DE]' : ''
                }`}
              >
                <td className="py-2 font-mono">{a.matricule}</td>
                <td>{a.nom}</td>
                <td>{a.postnom}</td>
                <td>{a.prenom}</td>
                <td>{a.sexe === 'MASCULIN' ? 'Masculin' : 'Féminin'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {historique.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#5B6472] mb-2">Cartes déjà générées</h3>
            <div className="flex gap-3 flex-wrap">
              {historique.map((c) => (
                <div key={c.id} className="text-center">
                  <img src={c.imageDataUrl} className="w-20 h-20 border border-[#DCD6C7] rounded-lg" />
                  <p className="text-xs text-[#5B6472] mt-1">
                    {new Date(c.genereeLe).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5 text-center">
        <h2 className="font-serif italic font-bold text-lg mb-1">Carte de Présence</h2>
        {selection ? (
          <>
            <p className="text-sm text-[#5B6472] mb-3">
              {selection.prenom} {selection.nom} — #{selection.matricule}
            </p>
            <div className="aspect-square bg-[#EDE9DE] rounded-lg flex items-center justify-center mb-4">
              {badge ? (
                <img src={badge} className="w-full h-full object-contain p-3" />
              ) : (
                <p className="text-xs text-[#5B6472]">Pas de QR code disponible</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onGenerer}
                disabled={chargement}
                className="flex-1 bg-ink text-paper rounded-lg py-2.5 font-semibold disabled:opacity-50"
              >
                {chargement ? 'Génération…' : 'Générer'}
              </button>
              {badge && (
                <button onClick={telecharger} className="flex-1 bg-green text-paper rounded-lg py-2.5 font-semibold">
                  Télécharger
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#5B6472] py-10">Sélectionnez un agent à gauche.</p>
        )}
      </div>
    </div>
  );
}
