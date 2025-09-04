import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const proposal = await prisma.proposal.create({
    data: {
      clientName: "João da Silva",
      clientPhone: "11999999999",
      clientDocument: "12345678900",
      debtValue: 100000,
      economiaValue: 20000,
      indenizacaoValue: 5000,
      proposalType: "honorario",
      proposalValue: 3000,
      user: {
        create: {
          name: "Admin",
          email: "admin@test.com",
          password: "123456"
        }
      }
    }
  });
  console.log(proposal);
}

main().catch(console.error);
