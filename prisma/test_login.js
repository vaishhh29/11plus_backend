const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // List all users and their password hashes
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, password: true }
  });

  console.log('=== All Users ===');
  for (const u of users) {
    const match = await bcrypt.compare('password123', u.password);
    const match2 = await bcrypt.compare('elevenplusbydt', u.password);
    console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | pw123: ${match} | elevenplusbydt: ${match2} | hash: ${u.password.substring(0, 20)}...`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
