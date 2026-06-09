import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(session?.user?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { taskId, title } = await req.json().catch(() => ({}));
  if (!taskId || !title?.trim()) {
    return NextResponse.json({ error: 'taskId and title are required' }, { status: 400 });
  }

  const subtask = await prisma.subtask.create({
    data: { taskId, title: title.trim() },
  });
  return NextResponse.json(subtask, { status: 201 });
}
