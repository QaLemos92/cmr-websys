// app/api/proposals/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  status: z.enum(['pendente', 'fechado', 'recusado']).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const p = await prisma.proposal.findUnique({ where: { id: params.id } });
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(p);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
