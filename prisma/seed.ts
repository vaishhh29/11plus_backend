import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Admin
  const adminEmail = 'adminofelevenplus@gmail.com';
  const adminPassword = 'elevenplusbydt';

  // Remove the old demo admin if it exists
  await prisma.user.deleteMany({
    where: { email: 'admin@gmail.com' },
  });

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Seeded default admin user successfully (${adminEmail} / ${adminPassword}).`);
  }

  // Clear existing academic tables and restart their identity sequences from 1
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "questions" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "syllabus" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "subjects" RESTART IDENTITY CASCADE;');
  console.log('Cleared all academic tables (questions, syllabus, subjects) and restarted identity sequences from 1.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
