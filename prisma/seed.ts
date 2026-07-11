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

  // Seed the 4 core subjects using upsert (safe to run multiple times)
  const subjects = [
    { id: 1, name: 'Maths', description: 'Mathematics - Number, Algebra, Geometry, Data Handling', icon: 'calculator' },
    { id: 2, name: 'English', description: 'English Language - Reading Comprehension, Grammar, Writing', icon: 'book' },
    { id: 3, name: 'Verbal Reasoning', description: 'Verbal Reasoning - Logic, Vocabulary, Pattern Recognition', icon: 'brain' },
    { id: 4, name: 'Non-Verbal Reasoning', description: 'Non-Verbal Reasoning - Spatial, Abstract, Visual Patterns', icon: 'shapes' },
  ];

  for (const subj of subjects) {
    await prisma.subject.upsert({
      where: { name: subj.name },
      update: { description: subj.description, icon: subj.icon },
      create: subj,
    });
  }
  console.log('Seeded 4 core subjects (Maths, English, Verbal Reasoning, Non-Verbal Reasoning).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
