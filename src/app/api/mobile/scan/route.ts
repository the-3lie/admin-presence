import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/qr';
import { authentifierRequete } from '@/lib/mobileAuth';
import { descripteurDepuisBase64, distanceEntreDescripteurs, SEUIL_CORRESPONDANCE } from '@/lib/faceapiNode';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Pointage depuis l'app mobile Scanner : QR code + photo (vérification
 * faciale). Réservé aux comptes ADMIN / SUPERVISEUR (mêmes rôles qui
 * avaient accès au module Scanner côté web).
 */
export async function POST(req: NextRequest) {
  const auth = authentifierRequete(req, ['ADMIN', 'SUPERVISEUR']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const qrContent: string | undefined = body?.qrContent;
  const photoBase64: string | undefined = body?.photoBase64;

  if (!qrContent) {
    return NextResponse.json({ success: false, message: 'QR code manquant' }, { status: 400 });
  }

  const { valid, matricule } = verifyToken(qrContent.trim());
  if (!valid || !matricule) {
    return NextResponse.json({ success: false, message: 'QR code invalide ou falsifié' }, { status: 400 });
  }

  const agent = await prisma.personnel.findUnique({ where: { matricule } });
  if (!agent) {
    return NextResponse.json({ success: false, message: 'Aucun agent ne correspond à ce badge' }, { status: 404 });
  }

  // Vérification faciale, si l'agent a un visage de référence enregistré.
  if (agent.faceDescriptor) {
    if (!photoBase64) {
      return NextResponse.json(
        { success: false, message: 'Photo de vérification faciale requise pour cet agent', requisVerification: true },
        { status: 400 }
      );
    }

    let descripteurCapture: number[] | null;
    try {
      descripteurCapture = await descripteurDepuisBase64(photoBase64);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Erreur lors de l’analyse faciale' }, { status: 500 });
    }

    if (!descripteurCapture) {
      return NextResponse.json({
        success: false,
        message: 'Aucun visage détecté sur la photo. Réessayez dans un endroit bien éclairé.'
      });
    }

    const reference = JSON.parse(agent.faceDescriptor) as number[];
    const distance = distanceEntreDescripteurs(descripteurCapture, reference);
    if (distance > SEUIL_CORRESPONDANCE) {
      return NextResponse.json({
        success: false,
        message: `Visage non reconnu pour ${agent.prenom} ${agent.nom}. Pointage refusé.`
      });
    }
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
    return NextResponse.json({
      success: true,
      type: 'ARRIVEE',
      agentNom: `${agent.prenom} ${agent.nom}`,
      heure: now,
      presenceId: presence.id
    });
  }

  if (existant.heureArrivee && !existant.heureDepart) {
    const presence = await prisma.presence.update({
      where: { id: existant.id },
      data: { heureDepart: now, statut: 'PRESENT' }
    });
    return NextResponse.json({
      success: true,
      type: 'DEPART',
      agentNom: `${agent.prenom} ${agent.nom}`,
      heure: now,
      presenceId: presence.id
    });
  }

  return NextResponse.json({
    success: false,
    message: `${agent.prenom} ${agent.nom} a déjà pointé son arrivée et son départ aujourd'hui`
  });
}
