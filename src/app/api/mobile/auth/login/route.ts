import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobileAuth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ success: false, message: 'Identifiants manquants' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 });
  }

  const valide = await bcrypt.compare(password, user.passwordHash);
  if (!valide) {
    return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 });
  }

  const token = signMobileToken({
    userId: user.id,
    username: user.username,
    role: user.role as any,
    personnelId: (user as any).personnelId ?? null
  });

  return NextResponse.json({
    success: true,
    token,
    role: user.role,
    username: user.username,
    personnelId: (user as any).personnelId ?? null
  });
}
