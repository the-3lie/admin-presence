'use server';

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/qr';
import { revalidatePath } from 'next/cache';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

type ScanResult =
  | { success: false; message: string }
  | { success: true; type: 'ARRIVEE' | 'DEPART'; agentNom: string; heure: Date; presenceId: number };

/**
 * Enregistre un pointage à partir du contenu décodé d'un QR.
 * 1er scan du jour pour l'agent -> heure d'arrivée, statut PAS_ENCORE
 * 2e scan du jour pour l'agent  -> heure de départ, statut PRESENT
 * scan supplémentaire le même jour -> ignoré (déjà pointé)
 */
export async function enregistrerScan(qrContent: string): Promise<ScanResult> {
  const { valid, matricule } = verifyToken(qrContent.trim());
  if (!valid || !matricule) {
    return { success: false, message: 'QR code invalide ou falsifié' };
  }

  const agent = await prisma.personnel.findUnique({ where: { matricule } });
  if (!agent) {
    return { success: false, message: 'Aucun agent ne correspond à ce badge' };
  }

  const today = startOfDay(new Date());
  const now = new Date();

  const existant = await prisma.presence.findUnique({
    where: { personnelId_date: { personnelId: agent.id, date: today } }
  });

  if (!existant) {
    const presence = await prisma.presence.create({
      data: { personnelId: agent.id, date: today, heureArrivee: now, statut: 'PAS_ENCORE' }
    });
    revalidatePath('/presences');
    return {
      success: true,
      type: 'ARRIVEE' as const,
      agentNom: `${agent.prenom} ${agent.nom}`,
      heure: now,
      presenceId: presence.id
    };
  }

  if (existant.heureArrivee && !existant.heureDepart) {
    const presence = await prisma.presence.update({
      where: { id: existant.id },
      data: { heureDepart: now, statut: 'PRESENT' }
    });
    revalidatePath('/presences');
    return {
      success: true,
      type: 'DEPART' as const,
      agentNom: `${agent.prenom} ${agent.nom}`,
      heure: now,
      presenceId: presence.id
    };
  }

  return { success: false, message: `${agent.prenom} ${agent.nom} a déjà pointé son arrivée et son départ aujourd'hui` };
}

export async function rechercherPresences(params: {
  matricule?: string;
  du?: string;
  au?: string;
}) {
  const where: any = {};
  if (params.matricule) {
    where.personnel = { matricule: { contains: params.matricule } };
  }
  if (params.du || params.au) {
    where.date = {};
    if (params.du) where.date.gte = new Date(params.du);
    if (params.au) where.date.lte = new Date(params.au);
  }

  return prisma.presence.findMany({
    where,
    include: { personnel: true },
    orderBy: { date: 'desc' }
  });
}

function joursOuvrablesDuMois(annee: number, mois: number): number {
  const dernierJour = new Date(annee, mois + 1, 0).getDate();
  let count = 0;
  for (let jour = 1; jour <= dernierJour; jour++) {
    const d = new Date(annee, mois, jour);
    const jourSemaine = d.getDay(); // 0 = dimanche, 6 = samedi
    if (jourSemaine !== 0 && jourSemaine !== 6) count++;
  }
  return count;
}

/**
 * Calcule pour un agent, sur un mois donné : jours ouvrables, présences, absences.
 * Un jour ouvrable sans aucun pointage compte comme une absence.
 */
export async function calculerEffectif(personnelId: string, annee: number, mois: number) {
  const debutMois = new Date(annee, mois, 1);
  const finMois = new Date(annee, mois + 1, 0, 23, 59, 59);

  const presences = await prisma.presence.findMany({
    where: { personnelId, date: { gte: debutMois, lte: finMois } }
  });

  const joursOuvrables = joursOuvrablesDuMois(annee, mois);
  const nbPresences = presences.filter((p) => p.heureArrivee).length;
  const nbAbsences = Math.max(joursOuvrables - nbPresences, 0);

  return { joursOuvrables, nbPresences, nbAbsences };
}