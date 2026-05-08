import prisma from './db.ts';

async function main() {
  console.log('Checking database connection...\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (e: any) {
    console.error('❌ Database connection FAILED');
    console.error('   Error:', e.message);
    console.log('\n   Check your DATABASE_URL in .env');
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const userCount = await prisma.user.count();
    console.log(`   Users:     ${userCount}`);

    const admin = await prisma.user.findUnique({ where: { email: 'admin@nexora.com' } });
    if (admin) {
      console.log(`   Admin:     ✅ exists (id: ${admin.id}, superAdmin: ${admin.isSuperAdmin}, active: ${admin.isActive})`);
    } else {
      console.log('   Admin:     ❌ NOT FOUND — run `npm run seed`');
    }

    const tenantCount = await prisma.tenant.count();
    console.log(`   Tenants:   ${tenantCount}`);

    const membershipCount = await prisma.tenantUser.count();
    console.log(`   Memberships: ${membershipCount}`);
  } catch (e: any) {
    console.error('\n❌ Query check failed — tables may not exist yet.');
    console.error('   Error:', e.message);
    console.log('\n   Run `npx prisma db push` first to create tables.');
  }

  await prisma.$disconnect();
}

main();
