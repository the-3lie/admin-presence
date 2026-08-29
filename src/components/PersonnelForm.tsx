'use client';

import { useRef, useState } from 'react';
import { creerAgent, modifierAgent, supprimerAgent } from '@/actions/personnel';
import FaceCapture from './FaceCapture';

type Agent = {
  id: string;
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: 'MASCULIN' | 'FEMININ';
  contact: string | null;
  adresse: string | null;
  entreprise: string;
  service: string;
  departement: string;
  fonction: string;
  niveauEtude: string | null;
  dateEngagement: Date;
  photoReference: string | null;
};

export default function PersonnelForm({
  agentSelectionne,
  onSauvegarde
}: {
  agentSelectionne: Agent | null;
  onSauvegarde: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setMessage('');
    const formData = new FormData(e.currentTarget);

    try {
      if (agentSelectionne) {
        await modifierAgent(agentSelectionne.id, formData);
        setMessage('Agent modifié.');
      } else {
        await creerAgent(formData);
        setMessage('Agent enregistré.');
        formRef.current?.reset();
      }
      onSauvegarde();
    } catch (err: any) {
      setMessage(err?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setChargement(false);
    }
  }

  async function onSupprimer() {
    if (!agentSelectionne) return;
    if (!confirm(`Retirer l'agent ${agentSelectionne.prenom} ${agentSelectionne.nom} ?`)) return;
    await supprimerAgent(agentSelectionne.id);
    onSauvegarde();
  }

  const val = (champ: keyof Agent, defaut = '') =>
    agentSelectionne ? String((agentSelectionne as any)[champ] ?? '') : defaut;

  const dateEngagementVal = agentSelectionne
    ? new Date(agentSelectionne.dateEngagement).toISOString().slice(0, 10)
    : '';

  return (
    <form ref={formRef} onSubmit={onSubmit} className="bg-white border border-[#DCD6C7] rounded-2xl p-5 space-y-3">
      <h2 className="font-bold mb-1">Informations sur l'agent</h2>

      <Champ label="Matricule" name="matricule" defaultValue={val('matricule')} required />
      <Champ label="Nom" name="nom" defaultValue={val('nom')} required />
      <Champ label="Postnom" name="postnom" defaultValue={val('postnom')} required />
      <Champ label="Prénom" name="prenom" defaultValue={val('prenom')} required />

      <div>
        <label className="block text-sm text-[#5B6472] mb-1">Sexe</label>
        <select name="sexe" defaultValue={val('sexe', 'MASCULIN')} className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2">
          <option value="MASCULIN">Masculin</option>
          <option value="FEMININ">Féminin</option>
        </select>
      </div>

      <Champ label="Contact" name="contact" defaultValue={val('contact')} />
      <Champ label="Adresse" name="adresse" defaultValue={val('adresse')} />
      <Champ label="Entreprise" name="entreprise" defaultValue={val('entreprise')} required />
      <Champ label="Service" name="service" defaultValue={val('service')} required />
      <Champ label="Département" name="departement" defaultValue={val('departement')} required />
      <Champ label="Fonction" name="fonction" defaultValue={val('fonction')} required />
      <Champ label="Niveau d'Étude" name="niveauEtude" defaultValue={val('niveauEtude')} />
      <Champ label="Date d'Engagement" name="dateEngagement" type="date" defaultValue={dateEngagementVal} required />

      {agentSelectionne && (
        <FaceCapture personnelId={agentSelectionne.id} photoExistante={agentSelectionne.photoReference} />
      )}

      {message && <p className="text-sm text-[#3F7D58]">{message}</p>}

      <div className="flex gap-2 pt-2">
        <button disabled={chargement} className="flex-1 bg-ink text-paper rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {agentSelectionne ? 'Mettre à jour' : 'Enregistrer'}
        </button>
        {agentSelectionne && (
          <button type="button" onClick={onSupprimer} className="px-4 rounded-lg border border-clay text-clay font-semibold">
            Retirer
          </button>
        )}
      </div>
    </form>
  );
}

function Champ({
  label,
  name,
  defaultValue,
  required,
  type = 'text'
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-[#5B6472] mb-1">{label}</label>
      <input
        key={defaultValue}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2"
      />
    </div>
  );
}
