import path from 'path';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
// @ts-ignore - build Node dédié fourni par le package, sans typings TS complets
import * as faceapi from '@vladmandic/face-api/dist/face-api.node.js';

// face-api.js attend des classes DOM (Canvas/Image/ImageData) qui n'existent
// pas côté serveur : on les fournit via le package `canvas`, comme documenté
// par face-api pour un usage Node.
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(process.cwd(), 'public', 'models');

export const SEUIL_CORRESPONDANCE = 0.55;

let modelesCharges = false;
let chargementEnCours: Promise<void> | null = null;

export async function chargerModelesNode(): Promise<void> {
  if (modelesCharges) return;
  if (chargementEnCours) return chargementEnCours;

  chargementEnCours = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)
    ]);
    modelesCharges = true;
  })();

  return chargementEnCours;
}

/**
 * Décode une photo envoyée en base64 (avec ou sans préfixe data URL) et
 * retourne son descripteur facial (128 nombres), ou null si aucun visage
 * n'est détecté sur la photo.
 */
export async function descripteurDepuisBase64(photoBase64: string): Promise<number[] | null> {
  await chargerModelesNode();

  const dataUrl = photoBase64.startsWith('data:') ? photoBase64 : `data:image/jpeg;base64,${photoBase64}`;
  const image = await loadImage(dataUrl);

  const detection = await faceapi
    .detectSingleFace(image as any, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection?.descriptor) return null;
  return Array.from(detection.descriptor as Float32Array);
}

export function distanceEntreDescripteurs(a: number[], b: number[]): number {
  return faceapi.euclideanDistance(a, b);
}
