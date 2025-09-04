// scripts/createTestUser.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('senha123', 10); // senha do usuário teste

  const user = await prisma.user.upsert({
    where: { email: 'test@user.com' },
    update: {},
    create: {
      name: 'Usuário Teste',
      email: 'test@user.com',
      password: passwordHash,
    },
  });

  console.log('Usuário teste criado ou encontrado:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
