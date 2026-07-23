const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Reset ALL user passwords to 'elevenplusbydt' so they match the login form default
  const hashedPassword = await bcrypt.hash('elevenplusbydt', 10);
  
  const result = await prisma.user.updateMany({
    data: {
      password: hashedPassword
    }
  });
  
  console.log(`Successfully updated passwords for ${result.count} users to 'elevenplusbydt'`);
  
  // Verify
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, password: true }
  });
  
  for (const u of users) {
    const match = await bcrypt.compare('elevenplusbydt', u.password);
    console.log(`  ${u.username} (${u.role}): password match = ${match}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
