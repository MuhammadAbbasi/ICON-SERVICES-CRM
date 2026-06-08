import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name:        z.string().min(2).optional(),
  description: z.string().optional(),
  memberIds:   z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, description, memberIds } = parsed.data;

  const team = await prisma.team.update({
    where: { id: params.id },
    data: {
      ...(name        && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(memberIds   && {
        members: {
          deleteMany: {},
          create: memberIds.map((userId) => ({ userId })),
        },
      }),
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  return NextResponse.json(team);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Admin only' }, { status: 403 });
  }
  await prisma.team.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}
