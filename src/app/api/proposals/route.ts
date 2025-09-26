import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // prisma configurado em src/lib/db.ts
import { Prisma } from "@prisma/client";

// POST /api/proposals
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const proposal = await prisma.proposal.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        clientDocument: body.clientDocument,
        debtValue: body.debtValue,
        economiaValue: body.economiaValue,
        indenizacaoValue: body.indenizacaoValue,
        proposalType: body.proposalType,
        proposalValue: body.proposalValue,
        notes: body.notes ?? "",
        status: body.status ?? "pendente",
        userId: "cmf47aoqr0001fdr8of09nqp1"
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao salvar proposta:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // exemplo: constraint violada
      return NextResponse.json(
        { error: `Erro Prisma: ${error.message}` },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro desconhecido ao salvar proposta" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      orderBy: { date: "desc" }, // ordenar por mais recentes
    });
    return NextResponse.json(proposals);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar propostas" }, { status: 500 });
  }
}
