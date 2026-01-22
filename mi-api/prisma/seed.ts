import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  const email = 'admin@demo.com';
  const passwordHash = await bcrypt.hash('AdminPassword123', 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: { email, name: 'Admin', passwordHash, role: Role.ADMIN },
  });

  console.log('Admin listo:', email);
}

main().finally(async () => prisma.$disconnect());
