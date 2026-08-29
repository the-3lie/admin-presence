import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import MenuPrincipal from '@/components/MenuPrincipal';
import Horloge from '@/components/Horloge';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  // L'espace agent est désormais une application mobile dédiée : un compte
  // AGENT n'a plus d'accès web.
  if ((session.user as any)?.role === 'AGENT') redirect('/login');

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-paper px-6 py-4 flex items-center justify-between border-b-2 border-amber">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber font-semibold">Pointage numérique</p>
          <h1 className="text-xl font-bold">Gestion des Présences</h1>
        </div>
        <Horloge />
      </header>

      <MenuPrincipal />

      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
