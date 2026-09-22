require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('drakekimaakabhosda', 12);


    const user = await prisma.user.upsert({
      where: { email: 'drakewearsofficial@gmail.com' },
      update: {
        password: hashedPassword,
        role: 'admin'
      },
      create: {
        name: 'DrakeWears Admin',
        email: 'drakewearsofficial@gmail.com',
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('Admin user ready:', user.email);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();
