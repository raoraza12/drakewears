const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const premiumTheme = {
  // Branding
  siteName: 'NOOR BRAND',
  contactEmail: 'concierge@luxebrand.com',
  contactPhone: '+92 300 888 NOOR',
  
  // Colors (The Midnight Gold Palette)
  primaryColor: '#c9a84c',
  secondaryColor: '#f5f0e8',
  bgColor: '#0d0d0f',
  cardColor: '#13131a',
  elevatedColor: '#1a1a24',
  inputColor: '#1e1e2c',
  textPrimary: '#f5f0e8',
  textSecondary: '#a09880',
  
  // Typography
  fontHeading: 'Playfair Display',
  fontBody: 'Inter',
  
  // Layout
  borderRadius: 12,
  borderRadiusLg: 20,
  navHeight: 80,
  
  // Hero
  homeHeroTitle: 'THE ART OF\nELITE TAILORING',
  homeHeroSub: 'Experience the pinnacle of luxury with our meticulously crafted garments, designed for those who command excellence.',
};

async function seed() {
  console.log('💎 Seeding Premium Aesthetic Theme...');
  
  for (const [key, value] of Object.entries(premiumTheme)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
  
  console.log('✅ Theme synchronization complete. Luxe Brand is now elite.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
