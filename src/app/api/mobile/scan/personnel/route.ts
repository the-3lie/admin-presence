import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authentifierRequete } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const auth = authentifierRequete(req, ['ADMIN', 'SUPERVISEUR']);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const terme = searchParams.get('q') || '';

  const agents = terme
    ? await prisma.personnel.findMany({
        where: {
          OR: [
            { matricule: { contains: terme, mode: 'insensitive' } },
            { nom: { contains: terme, mode: 'insensitive' } },
            { postnom: { contains: terme, mode: 'insensitive' } },
            { prenom: { contains: terme, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      })
    : await prisma.personnel.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });

  return NextResponse.json({ success: true, agents });
}
