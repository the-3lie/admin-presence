'use client';

const MODEL_URL = '/models';

// Distance en dessous de laquelle on considère que c'est le même visage.
// Plus bas = plus strict. 0.5-0.6 est la plage recommandée par face-api.js.
export const SEUIL_CORRESPONDANCE = 0.55;

let modelesCharges = false;
let chargementEnCours: Promise<void> | null = null;

// Import dynamique : évite que TensorFlow.js soit évalué côté serveur (SSR)
// lors du premier rendu de la page, ce qui casse le build Next.js.
async function getFaceApi() {
  return import('@vladmandic/face-api');
}

export async function chargerModeles(): Promise<void> {
  if (modelesCharges) return;
  if (chargementEnCours) return chargementEnCours;

  chargementEnCours = (async () => {
    const faceapi = await getFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelesCharges = true;
  })();

  return chargementEnCours;
}

/**
 * Détecte un visage sur une image/vidéo/canvas et retourne son descripteur
 * (128 nombres décrivant le visage). Retourne null si aucun visage détecté.
 */
export async function obtenirDescripteur(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await chargerModeles();
  const faceapi = await getFaceApi();

  const detection = await faceapi
    .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
}

export async function distanceEntreDescripteurs(
  a: Float32Array | number[],
  b: Float32Array | number[]
): Promise<number> {
  const faceapi = await getFaceApi();
  return faceapi.euclideanDistance(a as Float32Array, b as Float32Array);
}

export function descripteurVersJSON(d: Float32Array): string {
  return JSON.stringify(Array.from(d));
}

export function jsonVersDescripteur(s: string): Float32Array {
  return new Float32Array(JSON.parse(s));
}
