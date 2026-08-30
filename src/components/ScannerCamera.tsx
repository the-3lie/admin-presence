'use client';

import { useRef, useState } from 'react';
import jsQR from 'jsqr';
import { enregistrerScan } from '@/actions/presences';
import { obtenirDescripteurPourToken } from '@/actions/face';
import { chargerModeles, obtenirDescripteur, distanceEntreDescripteurs, SEUIL_CORRESPONDANCE } from '@/lib/faceapi';
import { obtenirFluxCameraFrontale } from '@/lib/camera';

const COOLDOWN_MS = 8000;
const TENTATIVES_VERIF = 40;
const INTERVALLE_TENTATIVE_MS = 350;

type Etape = 'qr' | 'verification-visage';

export default function ScannerCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<number | null>(null);
  const dernierScanRef = useRef<{ code: string; ts: number } | null>(null);

  const [actif, setActif] = useState(false);
  const [etape, setEtapeState] = useState<Etape>('qr');
  const etapeRef = useRef<Etape>('qr');
  const [resultat, setResultat] = useState<{ ok: boolean; titre: string; sous: string } | null>(null);

  function setEtape(valeur: Etape) {
    etapeRef.current = valeur;
    setEtapeState(valeur);
  }

  async function demarrer() {
    try {
      if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
      const stream = await obtenirFluxCameraFrontale();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await chargerModeles();
      setActif(true);
      setEtape('qr');
      boucle();
    } catch {
      setResultat({ ok: false, titre: 'Caméra indisponible', sous: "Autorisez l'accès caméra ou utilisez le pointage manuel" });
    }
  }

  function arreter() {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActif(false);
    setEtape('qr');
  }

  function boucle() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (etapeRef.current === 'qr' && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
      if (code?.data) {
        traiterCode(code.data.trim());
      }
    }
    loopRef.current = requestAnimationFrame(boucle);
  }

  async function traiterCode(code: string) {
    const now = Date.now();
    const dernier = dernierScanRef.current;
    if (dernier && dernier.code === code && now - dernier.ts < COOLDOWN_MS) return;
    dernierScanRef.current = { code, ts: now };

    const infosVisage = await obtenirDescripteurPourToken(code);

    if (!infosVisage.success) {
      setResultat({ ok: false, titre: 'Badge non reconnu', sous: infosVisage.message || '' });
      return;
    }

    if (!infosVisage.requisVerification) {
      await finaliserPointage(code);
      return;
    }

    await verifierVisageEtPointer(code, infosVisage.descripteur);
  }

  async function verifierVisageEtPointer(code: string, descripteurReference: number[]) {
    setEtape('verification-visage');
    setResultat({ ok: false, titre: 'Vérification du visage…', sous: 'Restez face à la caméra' });

    try {
      let correspondance = false;

      for (let i = 0; i < TENTATIVES_VERIF; i++) {
        if (!videoRef.current) break;
        const descripteur = await obtenirDescripteur(videoRef.current);
        if (descripteur) {
          const distance = await distanceEntreDescripteurs(descripteur, descripteurReference);
          if (distance < SEUIL_CORRESPONDANCE) {
            correspondance = true;
            break;
          }
        }
        await new Promise((r) => setTimeout(r, INTERVALLE_TENTATIVE_MS));
      }

      if (correspondance) {
        await finaliserPointage(code);
      } else {
        setResultat({
          ok: false,
          titre: 'Visage non reconnu',
          sous: "L'identité n'a pas pu être confirmée. Réessayez ou utilisez le pointage manuel."
        });
      }
    } catch {
      setResultat({ ok: false, titre: 'Erreur de vérification', sous: 'Réessayez ou utilisez le pointage manuel' });
    } finally {
      setEtape('qr');
    }
  }

  async function finaliserPointage(code: string) {
    const res = await enregistrerScan(code);
    if (res.success) {
      const heure = new Date(res.heure).toLocaleTimeString('fr-FR');
      setResultat({
        ok: true,
        titre: res.agentNom,
        sous: `${res.type === 'ARRIVEE' ? 'Arrivée' : 'Départ'} enregistrée à ${heure}`
      });
    } else {
      setResultat({ ok: false, titre: 'Badge non reconnu', sous: res.message || '' });
    }
    setTimeout(() => setResultat(null), 2500);
  }

  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-[#1B2430] rounded-2xl overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

      {!actif && (
        <button
          onClick={demarrer}
          className="absolute inset-0 flex items-center justify-center bg-[#1B2430] text-[#F7F5F0] font-semibold"
        >
          Activer la caméra
        </button>
      )}

      {actif && etape === 'verification-visage' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1B2430]/80 text-center px-6">
          <p className="text-[#F7F5F0] text-sm">{resultat?.titre}</p>
        </div>
      )}

      {resultat && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 ${
            resultat.ok ? 'bg-[#4A7C59]/90' : 'bg-[#E07856]/90'
          }`}
        >
          <p className="text-[#F7F5F0] text-lg font-bold">{resultat.titre}</p>
          <p className="text-[#F7F5F0] text-sm mt-2">{resultat.sous}</p>
        </div>
      )}

      {actif && (
        <button
          onClick={arreter}
          className="absolute bottom-3 right-3 text-xs bg-[#1B2430]/70 text-[#F7F5F0] px-3 py-1.5 rounded-full"
        >
          Arrêter la caméra
        </button>
      )}
    </div>
  );
}
