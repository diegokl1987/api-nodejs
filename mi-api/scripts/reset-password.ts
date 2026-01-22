import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
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
  const email = 'diego@demo.com';
  const newPass = 'Password123';

  const hash = await bcrypt.hash(newPass, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash, refreshTokenHash: null },
  });

  console.log('Password reseteado para', email);
}

main().finally(async () => prisma.$disconnect());
