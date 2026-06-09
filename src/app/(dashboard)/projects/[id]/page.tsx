import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { ProjectHierarchy } from '@/components/projects/ProjectHierarchy';
import { ProjectMeta } from '@/components/projects/ProjectMeta';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatCurrency, cn } from '@/lib/utils';
import type { ProjectStatus, Priority } from '@/types';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { name: true } });
  return { title: project?.name ?? 'Project' };
}

export default async function ProjectDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      company: { select: { id: true, name: true, email: true, phone: true } },
      domains: {
        orderBy: { createdAt: 'asc' },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, email: true, avatar: true } },
              subtasks: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const role = session?.user?.role;
  const canEdit = ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(role ?? '');
  const canDelete = ['ADMIN', 'MANAGER'].includes(role ?? '');

  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER', 'EMPLOYEE'] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  const allTasks = project.domains.flatMap((d) => d.tasks);
  const doneTasks = allTasks.filter((t) => t.status === 'DONE').length;

  const statusCfg = STATUS_CONFIG[project.status as ProjectStatus];
  const priorityCfg = PRIORITY_CONFIG[project.priority as Priority];

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={project.name}
        description={project.company.name}
      />

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Project summary bar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-5 rounded-xl border bg-card">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-md', statusCfg?.color)}>
                {statusCfg?.label}
              </span>
              <span className={cn('text-xs font-medium flex items-center gap-1.5', priorityCfg?.color)}>
                <span className={cn('h-2 w-2 rounded-full', priorityCfg?.dot)} />
                {priorityCfg?.label} Priority
              </span>
              {project.budget && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  Budget: {formatCurrency(project.budget)}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{doneTasks} of {allTasks.length} tasks complete</span>
                <span className="font-semibold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>

          <ProjectMeta project={project as any} />
        </div>

        {/* Hierarchy */}
        <ProjectHierarchy
          domains={project.domains as any}
          projectId={project.id}
          canEdit={canEdit}
          users={users}
        />
      </div>
    </div>
  );
}
