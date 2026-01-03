// Seed script to populate database with sample data
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✓ Admin user created:', admin.username);

  // Create sample oils with Myanmar units
  const oils = [
    {
      name_en: 'Palm Oil',
      name_my: 'ထန်းဆီ',
      description_en: 'Pure refined palm oil, ideal for cooking and frying. High heat stability.',
      description_my: 'သန့်စင်ထားသော ထန်းဆီ၊ ချက်ပြုတ်ရန်နှင့် ကြော်ရန်အတွက် သင့်လျော်သည်။',
      price_per_unit: 3500.00,
      unit: 'viss',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      is_active: true
    },
    {
      name_en: 'Groundnut Oil',
      name_my: 'မြေပဲဆီ',
      description_en: 'Premium groundnut oil with natural aroma. Perfect for traditional dishes.',
      description_my: 'သဘာဝအနံ့ပါရှိသော အရည်အသွေးမြင့် မြေပဲဆီ။ ရိုးရာအစားအစာများအတွက် အကောင်းဆုံး။',
      price_per_unit: 5200.00,
      unit: 'viss',
      image_url: 'https://images.unsplash.com/photo-1615485500834-bc10199bc7c4?w=400',
      is_active: true
    },
    {
      name_en: 'Sesame Oil',
      name_my: 'နှမ်းဆီ',
      description_en: 'Cold-pressed sesame oil with rich flavor. Excellent for salads and marinades.',
      description_my: 'အအေးညှစ်ထားသော အရသာရှိသော နှမ်းဆီ။ သုပ်နှင့် အခြာများအတွက် အသုံးပြုနိုင်သည်။',
      price_per_unit: 6800.00,
      unit: 'viss',
      image_url: 'https://images.unsplash.com/photo-1608181961051-e7db8e86e0fc?w=400',
      is_active: true
    },
    {
      name_en: 'Sunflower Oil',
      name_my: 'နေကြာဆီ',
      description_en: 'Light and healthy sunflower oil. Low in saturated fats.',
      description_my: 'ပေါ့ပါးပြီး ကျန်းမာသော နေကြာဆီ။ သန္ဓေအဆီနည်းသည်။',
      price_per_unit: 4500.00,
      unit: 'liter',
      image_url: 'https://images.unsplash.com/photo-1593288942460-c2a81d5cc902?w=400',
      is_active: true
    },
    {
      name_en: 'Coconut Oil',
      name_my: 'အုန်းဆီ',
      description_en: 'Extra virgin coconut oil. Great for cooking and skincare.',
      description_my: 'အရည်အသွေးမြင့် အုန်းဆီ။ ချက်ပြုတ်ရန်နှင့် အသားအရေစောင့်ရှောက်ရန် ကောင်းသည်။',
      price_per_unit: 7500.00,
      unit: 'viss',
      image_url: 'https://images.unsplash.com/photo-1520065949650-29a4191fc49b?w=400',
      is_active: true
    }
  ];

  for (const oil of oils) {
    const createdOil = await prisma.oil.create({
      data: oil
    });
    console.log(`✓ Oil created: ${createdOil.name_en} (${createdOil.name_my})`);
  }

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nDefault admin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

