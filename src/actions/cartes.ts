'use server';

import { prisma } from '@/lib/prisma';
import { signMatricule, generateQrDataUrl } from '@/lib/qr';
import { revalidatePath } from 'next/cache';

/**
 * Génère (ou régénère) le badge QR d'un agent.
 * Régénérer invalide l'ancien token — l'ancien QR imprimé/envoyé ne
 * fonctionnera plus, ce qui protège contre un badge perdu ou copié.
 */
export async function genererCarte(personnelId: string) {
  const agent = await prisma.personnel.findUniqueOrThrow({ where: { id: personnelId } });

  const token = signMatricule(agent.matricule);
  const imageDataUrl = await generateQrDataUrl(token);

  await prisma.personnel.update({
    where: { id: personnelId },
    data: { qrToken: token }
  });

  const carte = await prisma.carte.create({
    data: { personnelId, imageDataUrl }
  });

  revalidatePath('/cartes');
  return { imageDataUrl, carteId: carte.id, matricule: agent.matricule };
}

export async function listerCartes(personnelId: string) {
  return prisma.carte.findMany({
    where: { personnelId },
    orderBy: { genereeLe: 'desc' }
  });
}

export async function marquerCarteEnvoyee(carteId: string) {
  await prisma.carte.update({
    where: { id: carteId },
    data: { envoyeeLe: new Date() }
  });
  revalidatePath('/cartes');
}
