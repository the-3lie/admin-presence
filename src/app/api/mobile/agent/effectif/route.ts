import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authentifierRequete } from '@/lib/mobileAuth';

function joursOuvrablesDuMois(annee: number, mois: number): number {
  const dernierJour = new Date(annee, mois + 1, 0).getDate();
  let count = 0;
  for (let jour = 1; jour <= dernierJour; jour++) {
    const jourSemaine = new Date(annee, mois, jour).getDay();
    if (jourSemaine !== 0 && jourSemaine !== 6) count++;
  }
  return count;
}

export async function GET(req: NextRequest) {
  const auth = authentifierRequete(req, ['AGENT']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const personnelId = auth.payload.personnelId;
  if (!personnelId) return NextResponse.json({ success: false, message: 'Compte agent invalide' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const annee = Number(searchParams.get('annee'));
  const mois = Number(searchParams.get('mois'));
  if (!Number.isFinite(annee) || !Number.isFinite(mois)) {
    return NextResponse.json({ success: false, message: 'Paramètres annee/mois requis' }, { status: 400 });
  }

  const debutMois = new Date(annee, mois, 1);
  const finMois = new Date(annee, mois + 1, 0, 23, 59, 59);

  const presences = await prisma.presence.findMany({
    where: { personnelId, date: { gte: debutMois, lte: finMois } }
  });

  const joursOuvrables = joursOuvrablesDuMois(annee, mois);
  const nbPresences = presences.filter((p) => p.heureArrivee).length;
  const nbAbsences = Math.max(joursOuvrables - nbPresences, 0);

  return NextResponse.json({ success: true, joursOuvrables, nbPresences, nbAbsences });
}
