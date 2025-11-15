const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://019a6a48-4475-7868-b3fe-b6cda20c27dc:b4d6f70f-61cf-4080-ae48-a5461a521dbd@us-west-2.db.thenile.dev:5432/voteonit?sslmode=require"
    }
  }
});

async function inspectDatabase() {
  try {
    // Get tenants table structure
    const tenantsStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tenants';
    `;
    
    console.log('Tenants table structure:');
    console.table(tenantsStructure);
    
    // List all tables in the database
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('\nAll tables in the database:');
    console.table(allTables);
    
  } catch (error) {
    console.error('Error inspecting database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDatabase();
