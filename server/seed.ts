import prisma from './db.ts';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (e: any) {
    console.error('❌ Database connection failed:', e.message);
    console.error('   Check your DATABASE_URL in .env');
    await prisma.$disconnect();
    process.exit(1);
  }

  const email = 'admin@nexora.com';
  const password = '18Admin81!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists (${existing.id})`);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Admin Nexora',
      passwordHash,
      isSuperAdmin: true,
      isActive: true,
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Nexora Admin',
      slug: 'nexora-admin',
      specialty: 'Fisioterapia',
      subscriptionStatus: 'active',
      subscriptionPlan: 'PREMIUM',
    },
  });

  await prisma.tenantUser.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'OWNER',
    },
  });

  console.log('✅ Admin user created');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Tenant:   ${tenant.name} (${tenant.id})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
