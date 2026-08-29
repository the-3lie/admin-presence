'use server';

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/qr';
import { revalidatePath } from 'next/cache';

/**
 * Enregistre la photo + le descripteur facial de référence d'un agent.
 * Le descripteur est calculé côté client (face-api.js) et transmis déjà
 * calculé, pour ne pas faire tourner de modèle ML côté serveur.
 */
export async function enregistrerVisageReference(
  personnelId: string,
  descripteur: number[],
  photoDataUrl: string
) {
  await prisma.personnel.update({
    where: { id: personnelId },
    data: {
      faceDescriptor: JSON.stringify(descripteur),
      photoReference: photoDataUrl
    }
  });

  revalidatePath('/personnel');
  return { success: true as const };
}

export async function supprimerVisageReference(personnelId: string) {
  await prisma.personnel.update({
    where: { id: personnelId },
    data: { faceDescriptor: null, photoReference: null }
  });

  revalidatePath('/personnel');
  return { success: true as const };
}

/**
 * À partir d'un QR scanné, retourne uniquement ce qu'il faut au client
 * pour faire la vérification faciale — jamais les données complètes
 * de l'agent avant que son identité soit confirmée.
 */
export async function obtenirDescripteurPourToken(qrContent: string) {
  const { valid, matricule } = verifyToken(qrContent.trim());
  if (!valid || !matricule) {
    return { success: false as const, message: 'QR code invalide ou falsifié' };
  }

  const agent = await prisma.personnel.findUnique({
    where: { matricule },
    select: { id: true, faceDescriptor: true }
  });

  if (!agent) {
    return { success: false as const, message: 'Aucun agent ne correspond à ce badge' };
  }

  if (!agent.faceDescriptor) {
    // Pas de visage de référence enregistré pour cet agent : on laisse
    // passer sans vérification faciale (rétrocompatible avec les agents
    // déjà créés avant l'ajout de cette fonctionnalité).
    return { success: true as const, requisVerification: false as const };
  }

  return {
    success: true as const,
    requisVerification: true as const,
    descripteur: JSON.parse(agent.faceDescriptor) as number[]
  };
}
