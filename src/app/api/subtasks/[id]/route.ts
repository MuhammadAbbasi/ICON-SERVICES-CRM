import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { completed } = await req.json().catch(() => ({}));
  const subtask = await prisma.subtask.update({
    where: { id: params.id },
    data: { completed: Boolean(completed) },
  });
  return NextResponse.json(subtask);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.subtask.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}
