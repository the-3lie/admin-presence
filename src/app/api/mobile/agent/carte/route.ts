import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authentifierRequete } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const auth = authentifierRequete(req, ['AGENT']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const personnelId = auth.payload.personnelId;
  if (!personnelId) return NextResponse.json({ success: false, message: 'Compte agent invalide' }, { status: 400 });

  const carte = await prisma.carte.findFirst({
    where: { personnelId },
    orderBy: { genereeLe: 'desc' }
  });

  return NextResponse.json({ success: true, carte: carte ?? null });
}
