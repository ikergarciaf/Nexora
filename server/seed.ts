import prisma from './db.ts';
import bcrypt from 'bcryptjs';

const TENANTS = [
  { name: 'Nexora Fisioterapia', slug: 'nexora-fisioterapia', specialty: 'Fisioterapia' },
  { name: 'Nexora Dental', slug: 'nexora-dental', specialty: 'Odontología' },
  { name: 'Nexora Nutrición', slug: 'nexora-nutricion', specialty: 'Nutrición' },
  { name: 'Nexora Psicología', slug: 'nexora-psicologia', specialty: 'Psicología' },
  { name: 'Nexora Estética', slug: 'nexora-estetica', specialty: 'Estética' },
  { name: 'Nexora Clinical', slug: 'nexora-clinical', specialty: 'Medicina General' },
];

async function main() {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('Connected');
  } catch (e: any) {
    console.error('Database connection failed:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  }

  const email = 'admin@nexora.com';
  const password = '18Admin81!';

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: { email, name: 'Admin Nexora', passwordHash, isSuperAdmin: true, isActive: true },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  for (const t of TENANTS) {
    const existing = await prisma.tenant.findUnique({ where: { slug: t.slug } });
    if (existing) {
      console.log(`  ${t.name} already exists`);
      continue;
    }
    const tenant = await prisma.tenant.create({
      data: {
        name: t.name,
        slug: t.slug,
        specialty: t.specialty,
        subscriptionStatus: 'active',
        subscriptionPlan: 'PREMIUM',
      },
    });
    await prisma.tenantUser.create({
      data: { userId: user.id, tenantId: tenant.id, role: 'OWNER' },
    });
    console.log(`  Created ${t.name}`);
  }

  console.log(`\nLogin: ${email} / ${password}`);
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
