import { NextRequest, NextResponse } from 'next/server';

// Les apps scanner-web et agent-web sont déployées sur des domaines distincts
// (séparation volontaire, cf. discussion sécurité) et appellent cette API en
// cross-origin. L'authentification se fait par JWT (Authorization: Bearer),
// jamais par cookie de session — un CORS ouvert sur /api/mobile/* est donc
// sûr : sans le bon token, une requête cross-origin n'obtient rien.
export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }

  const response = NextResponse.next();
  const headers = corsHeaders();
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

export const config = {
  matcher: '/api/mobile/:path*'
};
