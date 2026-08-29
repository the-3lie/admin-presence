import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET = process.env.MOBILE_JWT_SECRET || process.env.QR_SIGNING_SECRET || 'dev-secret-change-moi';

export type MobileTokenPayload = {
  userId: string;
  username: string;
  role: 'ADMIN' | 'SUPERVISEUR' | 'AGENT';
  personnelId: string | null;
};

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as MobileTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extrait et vérifie le token depuis l'en-tête Authorization: Bearer <token>.
 * Si `rolesAutorises` est fourni, rejette les rôles qui n'en font pas partie.
 */
export function authentifierRequete(
  req: NextRequest,
  rolesAutorises?: Array<MobileTokenPayload['role']>
): { ok: true; payload: MobileTokenPayload } | { ok: false; status: number; message: string } {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { ok: false, status: 401, message: 'Authentification requise' };

  const payload = verifyMobileToken(token);
  if (!payload) return { ok: false, status: 401, message: 'Session expirée, reconnectez-vous' };

  if (rolesAutorises && !rolesAutorises.includes(payload.role)) {
    return { ok: false, status: 403, message: 'Accès non autorisé pour ce rôle' };
  }

  return { ok: true, payload };
}
