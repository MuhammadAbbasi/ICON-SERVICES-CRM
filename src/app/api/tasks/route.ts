import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  domainId:    z.string().min(1),
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).default('TODO'),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate:     z.string().optional().nullable(),
  assigneeId:  z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(session?.user?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { domainId, title, description, status, priority, dueDate, assigneeId } = parsed.data;

  const task = await prisma.task.create({
    data: {
      domainId,
      title:       title.trim(),
      description: description?.trim() || null,
      status,
      priority,
      dueDate:     dueDate ? new Date(dueDate) : null,
      assigneeId:  assigneeId || null,
      creatorId:   session!.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      subtasks: true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
