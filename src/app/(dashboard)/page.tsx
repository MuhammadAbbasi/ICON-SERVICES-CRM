import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddProjectButton } from '@/components/projects/AddProjectButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? '';
  const canDrag = ['ADMIN', 'MANAGER'].includes(role);

  const projectFilter =
    role === 'CLIENT'
      ? { company: { users: { some: { id: session?.user?.id } } } }
      : {};

  const [projects, companies] = await Promise.all([
    prisma.project.findMany({
      where: projectFilter,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        domains: {
          include: { tasks: { select: { status: true } } },
        },
      },
    }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Project Board"
        description={`${projects.length} projects across all phases`}
        action={
          canDrag ? <AddProjectButton companies={companies} /> : undefined
        }
      />
      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard initialProjects={projects as any} canDrag={canDrag} />
      </div>
    </div>
  );
}
