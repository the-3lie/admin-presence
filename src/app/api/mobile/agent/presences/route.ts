import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authentifierRequete } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const auth = authentifierRequete(req, ['AGENT']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const personnelId = auth.payload.personnelId;
  if (!personnelId) return NextResponse.json({ success: false, message: 'Compte agent invalide' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const du = searchParams.get('du');
  const au = searchParams.get('au');

  const where: any = { personnelId };
  if (du || au) {
    where.date = {};
    if (du) where.date.gte = new Date(du);
    if (au) where.date.lte = new Date(au);
  }

  const presences = await prisma.presence.findMany({ where, orderBy: { date: 'desc' } });
  return NextResponse.json({ success: true, presences });
}
