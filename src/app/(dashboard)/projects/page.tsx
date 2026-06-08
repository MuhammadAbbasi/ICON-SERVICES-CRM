import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { ProjectsGrid } from '@/components/projects/ProjectsGrid';
import { AddProjectButton } from '@/components/projects/AddProjectButton';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

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
          include: {
            tasks: { select: { id: true, status: true } },
          },
        },
      },
    }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const canCreate = ['ADMIN', 'MANAGER'].includes(role ?? '');

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Projects"
        description={`${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace`}
        action={canCreate ? <AddProjectButton companies={companies} /> : undefined}
      />
      <div className="flex-1 p-6 animate-fade-in">
        <ProjectsGrid projects={projects as any} />
      </div>
    </div>
  );
}
