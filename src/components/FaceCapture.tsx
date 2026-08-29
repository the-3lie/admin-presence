'use client';

import { useEffect, useRef, useState } from 'react';
import { chargerModeles, obtenirDescripteur, descripteurVersJSON } from '@/lib/faceapi';
import { obtenirFluxCameraFrontale } from '@/lib/camera';
import { enregistrerVisageReference, supprimerVisageReference } from '@/actions/face';

export default function FaceCapture({
  personnelId,
  photoExistante
}: {
  personnelId: string;
  photoExistante: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [actif, setActif] = useState(false);
  const [chargementModeles, setChargementModeles] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(photoExistante);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Le flux caméra n'est attaché à la balise vidéo qu'une fois qu'elle est
  // réellement montée dans le DOM (donc après que `actif` soit passé à
  // true et que React ait re-rendu), sinon videoRef.current est encore null.
  useEffect(() => {
    if (actif && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [actif]);

  async function demarrer() {
    setMessage('');
    setChargementModeles(true);
    try {
      await chargerModeles();
      const stream = await obtenirFluxCameraFrontale();
      streamRef.current = stream;
      setActif(true);
    } catch {
      setMessage("Impossible d'accéder à la caméra frontale.");
    } finally {
      setChargementModeles(false);
    }
  }

  function arreter() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActif(false);
  }

  async function capturer() {
    if (!videoRef.current) return;
    setEnCours(true);
    setMessage('');

    try {
      const descripteur = await obtenirDescripteur(videoRef.current);
      if (!descripteur) {
        setMessage('Aucun visage détecté. Placez-vous bien en face de la caméra, dans un endroit éclairé.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      await enregistrerVisageReference(personnelId, Array.from(descripteur), photoDataUrl);

      setPhoto(photoDataUrl);
      setMessage('Visage de référence enregistré.');
      arreter();
    } catch {
      setMessage("Erreur lors de l'enregistrement du visage.");
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    if (!confirm('Retirer le visage de référence de cet agent ?')) return;
    await supprimerVisageReference(personnelId);
    setPhoto(null);
    setMessage('Visage de référence retiré.');
  }

  return (
    <div className="border border-[#DCD6C7] rounded-xl p-4 space-y-3">
      <p className="text-sm font-bold">Vérification faciale</p>
      <p className="text-xs text-[#5B6472]">
        Enregistre une photo de référence pour que le scanner puisse confirmer l'identité de cet agent au pointage.
      </p>

      {photo && !actif && (
        <div className="flex items-center gap-3">
          <img src={photo} alt="Visage de référence" className="w-16 h-16 rounded-full object-cover border border-[#DCD6C7]" />
          <button type="button" onClick={supprimer} className="text-xs text-clay font-semibold">
            Retirer
          </button>
        </div>
      )}

      {actif && (
        <div className="relative aspect-square max-w-[240px] bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} muted playsInline autoPlay className="w-full h-full object-cover" />
        </div>
      )}

      {message && <p className="text-xs text-[#5B6472]">{message}</p>}

      <div className="flex gap-2">
        {!actif ? (
          <button
            type="button"
            onClick={demarrer}
            disabled={chargementModeles}
            className="px-4 py-2 rounded-lg border border-[#DCD6C7] text-sm font-semibold disabled:opacity-50"
          >
            {chargementModeles ? 'Chargement…' : photo ? 'Reprendre la photo' : 'Activer la caméra'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capturer}
              disabled={enCours}
              className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold disabled:opacity-50"
            >
              {enCours ? 'Analyse…' : 'Capturer'}
            </button>
            <button type="button" onClick={arreter} className="px-4 py-2 rounded-lg border border-[#DCD6C7] text-sm font-semibold">
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}
