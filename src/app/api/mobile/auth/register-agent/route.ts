import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobileAuth';

const schema = z.object({
  matricule: z.string().min(1, 'Le matricule est obligatoire'),
  password: z.string().min(6, 'Mot de passe trop court (6 caractères minimum)')
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.errors[0]?.message || 'Données invalides' },
      { status: 400 }
    );
  }
  const { matricule, password } = parsed.data;

  const agent = await prisma.personnel.findUnique({ where: { matricule } });
  if (!agent) {
    return NextResponse.json(
      { success: false, message: 'Aucun agent ne correspond à ce matricule. Contactez votre administration.' },
      { status: 404 }
    );
  }

  const compteExistant = await prisma.user.findFirst({
    where: { OR: [{ username: matricule }, { personnelId: agent.id }] }
  });
  if (compteExistant) {
    return NextResponse.json(
      { success: false, message: 'Un compte existe déjà pour ce matricule. Utilisez plutôt la connexion.' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username: matricule, passwordHash, role: 'AGENT', personnelId: agent.id }
  });

  const token = signMobileToken({
    userId: user.id,
    username: user.username,
    role: 'AGENT',
    personnelId: agent.id
  });

  return NextResponse.json({ success: true, token, role: 'AGENT', username: user.username, personnelId: agent.id });
}
