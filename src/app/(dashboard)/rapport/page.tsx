'use client';

import { useState } from 'react';
import { genererRapport } from '@/actions/rapport';

export default function RapportPage() {
  const [departement, setDepartement] = useState('');
  const [du, setDu] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [au, setAu] = useState(new Date().toISOString().slice(0, 10));
  const [lignes, setLignes] = useState<any[] | null>(null);

  async function rechercher() {
    setLignes(await genererRapport({ departement: departement || undefined, du, au }));
  }

  return (
    <div className="bg-white border border-[#DCD6C7] rounded-2xl p-5">
      <div className="flex flex-wrap gap-3 items-end justify-between mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#5B6472] mb-1">Département</label>
            <input value={departement} onChange={(e) => setDepartement(e.target.value)} className="border border-[#DCD6C7] rounded-lg px-3 py-2" />
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
            Rapport
          </button>
        </div>
        {lignes && lignes.length > 0 && (
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-green text-white font-semibold">
            Imprimer
          </button>
        )}
      </div>

      {lignes === null ? (
        <p className="text-center text-sm text-[#5B6472] py-10">Choisissez une période puis lancez le rapport.</p>
      ) : lignes.length === 0 ? (
        <p className="text-center text-sm text-[#5B6472] py-10">Aucun résultat trouvé.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[#5B6472] border-b-2 border-ink">
              <th className="py-2">Matricule</th>
              <th>Nom</th>
              <th>Postnom</th>
              <th>Prénom</th>
              <th>Département</th>
              <th>Mois</th>
              <th>Jours ouvrables</th>
              <th>Présences</th>
              <th>Absences</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={i} className="border-b border-[#DCD6C7]">
                <td className="py-2 font-mono">{l.matricule}</td>
                <td>{l.nom}</td>
                <td>{l.postnom}</td>
                <td>{l.prenom}</td>
                <td>{l.departement}</td>
                <td>{l.mois}</td>
                <td>{l.joursOuvrables}</td>
                <td className="text-green font-semibold">{l.nbPresences}</td>
                <td className="text-clay font-semibold">{l.nbAbsences}</td>
                <td>{l.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
