'use server';

import { prisma } from '@/lib/prisma';

export async function genererRapport(params: { departement?: string; du: string; au: string }) {
  const agents = await prisma.personnel.findMany({
    where: params.departement ? { departement: params.departement } : undefined
  });

  const du = new Date(params.du);
  const au = new Date(params.au);
  const mois = du.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const joursOuvrables = countJoursOuvrables(du, au);

  const lignes = [];
  for (const agent of agents) {
    const presences = await prisma.presence.findMany({
      where: { personnelId: agent.id, date: { gte: du, lte: au } }
    });
    const nbPresences = presences.filter((p) => p.heureArrivee).length;
    const nbAbsences = Math.max(joursOuvrables - nbPresences, 0);

    lignes.push({
      matricule: agent.matricule,
      nom: agent.nom,
      postnom: agent.postnom,
      prenom: agent.prenom,
      departement: agent.departement,
      mois,
      joursOuvrables,
      nbPresences,
      nbAbsences,
      date: new Date().toLocaleDateString('fr-FR')
    });
  }

  return lignes;
}

function countJoursOuvrables(du: Date, au: Date): number {
  let count = 0;
  const cursor = new Date(du);
  while (cursor <= au) {
    const jourSemaine = cursor.getDay();
    if (jourSemaine !== 0 && jourSemaine !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
