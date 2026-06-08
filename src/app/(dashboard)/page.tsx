import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // Scope queries by role
  const projectFilter = role === 'CLIENT'
    ? { company: { users: { some: { id: session?.user?.id } } } }
    : {};

  const [totalProjects, activeProjects, totalTasks, completedTasks, recentProjects] = await Promise.all([
    prisma.project.count({ where: projectFilter }),
    prisma.project.count({ where: { ...projectFilter, status: 'ACTIVE' } }),
    prisma.task.count({
      where: { domain: { project: projectFilter } },
    }),
    prisma.task.count({
      where: { domain: { project: projectFilter }, status: 'DONE' },
    }),
    prisma.project.findMany({
      where: projectFilter,
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: { select: { name: true } },
        domains: {
          include: { tasks: { select: { status: true } } },
        },
      },
    }),
  ]);

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`Good morning, ${session?.user?.name?.split(' ')[0]} 👋`}
        description="Here's what's happening across your projects today."
      />

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        <StatsCards
          totalProjects={totalProjects}
          activeProjects={activeProjects}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          overallProgress={overallProgress}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentProjects projects={recentProjects as any} />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
