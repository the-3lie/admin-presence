'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculerEffectif } from './presences';
import { listerCartes } from './cartes';

/**
 * Récupère le personnelId de l'agent connecté à partir de la session
 * serveur — jamais depuis un paramètre transmis par le client, pour
 * garantir qu'un agent ne peut consulter que ses propres données.
 */
async function getPersonnelIdConnecte(): Promise<string> {
  const session = await getServerSession(authOptions);
  const personnelId = (session?.user as any)?.personnelId;
  if (!session || (session.user as any)?.role !== 'AGENT' || !personnelId) {
    throw new Error('Accès réservé aux agents connectés');
  }
  return personnelId;
}

export async function monProfil() {
  const personnelId = await getPersonnelIdConnecte();

  const agent = await prisma.personnel.findUniqueOrThrow({ where: { id: personnelId } });

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);
  const presenceDuJour = await prisma.presence.findUnique({
    where: { personnelId_date: { personnelId, date: aujourdHui } }
  });

  return { agent, presenceDuJour };
}

export async function mesPresences(params: { du?: string; au?: string }) {
  const personnelId = await getPersonnelIdConnecte();

  const where: any = { personnelId };
  if (params.du || params.au) {
    where.date = {};
    if (params.du) where.date.gte = new Date(params.du);
    if (params.au) where.date.lte = new Date(params.au);
  }

  return prisma.presence.findMany({ where, orderBy: { date: 'desc' } });
}

export async function monEffectifMensuel(annee: number, mois: number) {
  const personnelId = await getPersonnelIdConnecte();
  return calculerEffectif(personnelId, annee, mois);
}

export async function maCarte() {
  const personnelId = await getPersonnelIdConnecte();
  const cartes = await listerCartes(personnelId);
  return cartes[0] ?? null;
}
