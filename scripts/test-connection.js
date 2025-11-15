const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('🔍 Test query result:', result);
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
