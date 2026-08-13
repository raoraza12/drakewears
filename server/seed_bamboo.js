const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const bambooTheme = {
  // Branding
  siteName: 'NOOR BRAND',
  contactEmail: 'natural@luxebrand.com',
  contactPhone: '+92 300 NATURAL',
  
  // Colors (The Natural Bamboo Elite Palette)
  primaryColor: '#1d3c34', // Deep Forest Green
  secondaryColor: '#f4f1de', // Natural Ivory
  bgColor: '#0f1a18', // Dark Jungle
  cardColor: '#162421', // Slate Green
  elevatedColor: '#1e2f2a',
  inputColor: '#12221e',
  textPrimary: '#f4f1de',
  textSecondary: '#9ba495',
  
  // Typography
  fontHeading: 'Playfair Display',
  fontBody: 'Outfit', // Smooth modern font
  
  // Layout
  borderRadius: 8, // More angular for organic feel
  borderRadiusLg: 16,
  navHeight: 85,
  
  // Hero
  homeHeroTitle: 'NATURE\'S FINEST\nTHREADS',
  homeHeroSub: 'Discover the intersection of organic textures and high-fashion tailoring. Sustainable. Sophisticated. Singular.',
};

async function seed() {
  console.log('🎋 Seeding Natural Bamboo Theme...');
  
  for (const [key, value] of Object.entries(bambooTheme)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
  
  console.log('✅ Bamboo theme applied. The project is now "Bamboo" 🎋');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
