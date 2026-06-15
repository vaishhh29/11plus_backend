import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'adminofelevenplus@gmail.com';
  const adminPassword = 'elevenplusbydt';

  // Remove the old demo admin if it exists
  await prisma.user.deleteMany({
    where: { email: 'admin@gmail.com' },
  });

  // Check if correct admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Seeded default admin user successfully (${adminEmail} / ${adminPassword}).`);
  } else {
    console.log('Admin user already exists. Skipping seeding.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
