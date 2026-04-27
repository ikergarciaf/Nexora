import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'ikergarciafdez1@gmail.com';
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    user = await prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true }
    });
    console.log(`Updated existing user ${email} to super admin.`);
  } else {
    const passwordHash = await bcrypt.hash('admin123', 12);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Iker Super Admin',
        passwordHash,
        isSuperAdmin: true
      }
    });
    console.log(`Created new super admin user ${email} with password 'admin123'.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
