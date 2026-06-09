import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q   = url.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const role      = session.user.role;
  const companyId = session.user.companyId;

  // CLIENT users only see their own company's data
  const projectClientFilter  = role === 'CLIENT' && companyId ? { companyId } : {};
  const taskClientFilter     = role === 'CLIENT' && companyId ? { domain: { project: { companyId } } } : {};
  const subtaskClientFilter  = role === 'CLIENT' && companyId ? { task: { domain: { project: { companyId } } } } : {};

  const [projects, tasks, subtasks] = await Promise.all([
    // ── Projects ──────────────────────────────────────────────
    prisma.project.findMany({
      where: {
        ...projectClientFilter,
        OR: [
          { name:        { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: { company: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),

    // ── Tasks ─────────────────────────────────────────────────
    prisma.task.findMany({
      where: {
        ...taskClientFilter,
        OR: [
          { title:       { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: {
        domain: {
          select: {
            id: true, name: true,
            project: {
              select: {
                id: true, name: true,
                company: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),

    // ── Subtasks ──────────────────────────────────────────────
    prisma.subtask.findMany({
      where: {
        ...subtaskClientFilter,
        OR: [
          { title:        { contains: q } },
          { assigneeName: { contains: q } },
          { notes:        { contains: q } },
          { description:  { contains: q } },
        ],
      },
      include: {
        task: {
          select: {
            id: true, title: true,
            domain: {
              select: {
                id: true, name: true,
                project: {
                  select: {
                    id: true, name: true,
                    company: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  const results = [
    // 1 — Projects (top of hierarchy)
    ...projects.map((p) => ({
      type:       'project' as const,
      id:         p.id,
      title:      p.name,
      href:       `/projects/${p.id}`,
      breadcrumb: [p.company.name],
    })),

    // 2 — Tasks
    ...tasks.map((t) => ({
      type:       'task' as const,
      id:         t.id,
      title:      t.title,
      href:       `/projects/${t.domain.project.id}`,
      breadcrumb: [t.domain.project.company.name, t.domain.project.name, t.domain.name],
    })),

    // 3 — Subtasks (deepest level — show full path)
    ...subtasks.map((s) => ({
      type:       'subtask' as const,
      id:         s.id,
      title:      s.title,
      href:       `/projects/${s.task.domain.project.id}`,
      breadcrumb: [
        s.task.domain.project.company.name,
        s.task.domain.project.name,
        s.task.domain.name,
        s.task.title,
      ],
    })),
  ];

  return NextResponse.json({ results });
}
