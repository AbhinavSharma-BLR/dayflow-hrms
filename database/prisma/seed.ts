import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  console.log('Seeding initial example accounts...');

  // 1. Seed HR Admin account (admin.hr@dayflow.com / Admin123!)
  const adminEmail = 'admin.hr@dayflow.com';
  const adminPasswordHash = await bcrypt.hash('Admin123!', BCRYPT_SALT_ROUNDS);

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { employee: true },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: Role.HR,
        emailVerified: true,
        mustChangePassword: false,
        employee: {
          create: {
            employeeId: 'DAYADMIN20260001',
            firstName: 'HR',
            lastName: 'Administrator',
            email: adminEmail,
            department: 'Human Resources',
            designation: 'HR Director',
            isActive: true,
          },
        },
      },
      include: { employee: true },
    });
    console.log('Created HR Admin user:', adminUser.email, 'Employee ID:', adminUser.employee?.employeeId);
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: adminPasswordHash, emailVerified: true },
    });
    console.log('Updated HR Admin user:', adminUser.email);
  }

  // 2. Seed Employee account (alex.rivera@dayflow.com / Employee123! / DAYALRI20260001)
  const employeeEmail = 'alex.rivera@dayflow.com';
  const employeePasswordHash = await bcrypt.hash('Employee123!', BCRYPT_SALT_ROUNDS);

  let employeeUser = await prisma.user.findUnique({
    where: { email: employeeEmail },
    include: { employee: true },
  });

  if (!employeeUser) {
    employeeUser = await prisma.user.create({
      data: {
        email: employeeEmail,
        passwordHash: employeePasswordHash,
        role: Role.EMPLOYEE,
        emailVerified: true,
        mustChangePassword: false,
        employee: {
          create: {
            employeeId: 'DAYALRI20260001',
            firstName: 'Alex',
            lastName: 'Rivera',
            email: employeeEmail,
            department: 'Engineering',
            designation: 'Senior Fullstack Engineer',
            isActive: true,
          },
        },
      },
      include: { employee: true },
    });
    console.log('Created Employee user:', employeeUser.email, 'Employee ID:', employeeUser.employee?.employeeId);
  } else {
    await prisma.user.update({
      where: { id: employeeUser.id },
      data: { passwordHash: employeePasswordHash, emailVerified: true },
    });
    console.log('Updated Employee user:', employeeUser.email);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
