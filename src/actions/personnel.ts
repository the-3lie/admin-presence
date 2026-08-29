'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const personnelSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est obligatoire'),
  nom: z.string().min(1),
  postnom: z.string().min(1),
  prenom: z.string().min(1),
  sexe: z.enum(['MASCULIN', 'FEMININ']),
  contact: z.string().optional(),
  adresse: z.string().optional(),
  entreprise: z.string().min(1),
  service: z.string().min(1),
  departement: z.string().min(1),
  fonction: z.string().min(1),
  niveauEtude: z.string().optional(),
  dateEngagement: z.string().min(1)
});

export async function creerAgent(formData: FormData) {
  const data = personnelSchema.parse(Object.fromEntries(formData));

  await prisma.personnel.create({
    data: { ...data, dateEngagement: new Date(data.dateEngagement) }
  });

  revalidatePath('/personnel');
  return { success: true };
}

export async function modifierAgent(id: string, formData: FormData) {
  const data = personnelSchema.parse(Object.fromEntries(formData));

  await prisma.personnel.update({
    where: { id },
    data: { ...data, dateEngagement: new Date(data.dateEngagement) }
  });

  revalidatePath('/personnel');
  return { success: true };
}

export async function supprimerAgent(id: string) {
  await prisma.personnel.delete({ where: { id } });
  revalidatePath('/personnel');
  return { success: true };
}

export async function rechercherAgents(terme: string) {
  if (!terme) {
    return prisma.personnel.findMany({ orderBy: { createdAt: 'desc' } });
  }
  return prisma.personnel.findMany({
    where: {
      OR: [
        { matricule: { contains: terme, mode: 'insensitive' } },
        { nom: { contains: terme, mode: 'insensitive' } },
        { postnom: { contains: terme, mode: 'insensitive' } },
        { prenom: { contains: terme, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}
