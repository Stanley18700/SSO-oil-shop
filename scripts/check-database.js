// Database connection test script
// Run this to verify your database is working
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  try {
    // Test 1: Database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test 2: Check if tables exist and count records
    const oilCount = await prisma.oil.count();
    const userCount = await prisma.user.count();

    console.log(`✅ Tables verified:`);
    console.log(`   - oils table: ${oilCount} records`);
    console.log(`   - users table: ${userCount} records`);

    // Test 3: Fetch sample data
    if (oilCount > 0) {
      const sampleOil = await prisma.oil.findFirst();
      console.log(`\n✅ Sample oil data:`);
      console.log(`   - ${sampleOil.name_en} (${sampleOil.name_my})`);
      console.log(`   - Price: ${sampleOil.price_per_unit} MMK`);
    }

    if (userCount > 0) {
      const sampleUser = await prisma.user.findFirst();
      console.log(`\n✅ Sample user data:`);
      console.log(`   - Username: ${sampleUser.username}`);
      console.log(`   - Role: ${sampleUser.role}`);
    }

    console.log('\n🎉 Database is working perfectly!\n');

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env file');
    console.log('   3. Ensure database "sso_oil_shop" exists');
    console.log('   4. Run migrations: npm run prisma:migrate');
    console.log('   5. Run seed: npm run prisma:seed\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

