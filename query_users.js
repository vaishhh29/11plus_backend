const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const email = 'teacher@11plus.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Doctor Sarah',
        password: hashedPassword,
        role: Role.TEACHER,
        teacherProfile: {
          create: {
            teacherCode: 'TCH-100200',
            subjects: ['Maths', 'English'],
            contactInfo: '+44 7700 900088',
            name: 'Doctor Sarah',
            email
          }
        }
      }
    });
    console.log("Teacher created successfully!");
  } else {
    console.log("Teacher already exists!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
