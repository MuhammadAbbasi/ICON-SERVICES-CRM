import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { TeamsManager } from '@/components/teams/TeamsManager';

export const metadata = { title: 'Teams' };

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) redirect('/');

  const [teams, allEmployees] = await Promise.all([
    prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['EMPLOYEE', 'MANAGER'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Teams"
        description={`${teams.length} internal team${teams.length !== 1 ? 's' : ''}`}
      />
      <div className="flex-1 p-6 animate-fade-in">
        <TeamsManager initialTeams={teams as any} allEmployees={allEmployees} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
