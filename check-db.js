const { PrismaClient } = require('./prisma/generated/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    // Try to connect to the database
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    // Try to query the database
    const userCount = await prisma.user.count();
    console.log(`Database is accessible. User count: ${userCount}`);
    
    // List all collections
    const collections = await prisma.$runCommandRaw({ listCollections: 1 });
    console.log('Collections:', collections);
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 