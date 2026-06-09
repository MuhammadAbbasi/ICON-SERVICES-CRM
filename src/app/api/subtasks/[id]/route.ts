import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.completed    !== undefined) data.completed    = Boolean(body.completed);
  if (body.description  !== undefined) data.description  = body.description  || null;
  if (body.assigneeName !== undefined) data.assigneeName = body.assigneeName || null;
  if (body.labourCount  !== undefined) data.labourCount  = body.labourCount  != null ? Number(body.labourCount)  : null;
  if (body.unit         !== undefined) data.unit         = body.unit         || null;
  if (body.quantity     !== undefined) data.quantity     = body.quantity     != null ? Number(body.quantity)     : null;
  if (body.rate         !== undefined) data.rate         = body.rate         != null ? Number(body.rate)         : null;
  if (body.notes        !== undefined) data.notes        = body.notes        || null;

  const subtask = await prisma.subtask.update({
    where: { id: params.id },
    data,
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
