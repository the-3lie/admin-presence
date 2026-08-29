import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authentifierRequete } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const auth = authentifierRequete(req, ['AGENT']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const personnelId = auth.payload.personnelId;
  if (!personnelId) {
    return NextResponse.json({ success: false, message: 'Compte agent invalide' }, { status: 400 });
  }

  const agent = await prisma.personnel.findUnique({ where: { id: personnelId } });
  if (!agent) return NextResponse.json({ success: false, message: 'Agent introuvable' }, { status: 404 });

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);
  const presenceDuJour = await prisma.presence.findUnique({
    where: { personnelId_date: { personnelId, date: aujourdHui } }
  });

  return NextResponse.json({ success: true, agent, presenceDuJour });
}
