import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name:    z.string().min(2).optional(),
  email:   z.string().email().optional().or(z.literal('')),
  phone:   z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.name    && { name:    parsed.data.name }),
      email:   parsed.data.email   || null,
      phone:   parsed.data.phone   || null,
      address: parsed.data.address || null,
      website: parsed.data.website || null,
    },
  });
  return NextResponse.json(company);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Admin only' }, { status: 403 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}
