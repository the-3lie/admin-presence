import crypto from 'crypto';
import QRCode from 'qrcode';

const SECRET = process.env.QR_SIGNING_SECRET || 'dev-secret-change-moi';

/**
 * Construit un token signé "matricule.signature" afin qu'un QR
 * ne puisse pas être falsifié en recopiant simplement un matricule.
 */
export function signMatricule(matricule: string): string {
  const signature = crypto.createHmac('sha256', SECRET).update(matricule).digest('hex').slice(0, 16);
  return `${matricule}.${signature}`;
}

export function verifyToken(token: string): { valid: boolean; matricule?: string } {
  const [matricule, signature] = token.split('.');
  if (!matricule || !signature) return { valid: false };
  const expected = crypto.createHmac('sha256', SECRET).update(matricule).digest('hex').slice(0, 16);
  return { valid: signature === expected, matricule };
}

export async function generateQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    width: 300,
    margin: 1,
    color: { dark: '#1B2430', light: '#F7F5F0' }
  });
}
