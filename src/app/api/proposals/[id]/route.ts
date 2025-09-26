// app/api/proposals/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  status: z.enum(['pendente', 'fechado', 'recusado']).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  req: Request,
  context: { params: { id: string } } // ⚠️ use context.params
) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: context.params.id },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(proposal);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } } // <-- sem Promise
) {
  try {
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.proposal.update({
      where: { id: context.params.id }, // <-- aqui usa context.params
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
