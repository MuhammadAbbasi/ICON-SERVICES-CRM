import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, companyId, status, priority, startDate, endDate, budget, domains } = body;

    if (!name?.trim() || !companyId) {
      return NextResponse.json({ error: 'Name and companyId are required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        companyId,
        status: status ?? 'ACTIVE',
        priority: priority ?? 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ?? null,
        domains: {
          create: (domains ?? [])
            .filter((d: any) => d.name?.trim())
            .map((d: any) => ({
              name: d.name.trim(),
              color: d.color ?? '#6366f1',
            })),
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (e: any) {
    console.error('[POST /api/projects]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const filter = session.user.role === 'CLIENT'
    ? { company: { users: { some: { id: session.user.id } } } }
    : {};

  const projects = await prisma.project.findMany({
    where: filter,
    include: { company: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(projects);
}
