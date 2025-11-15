const { Client } = require('pg');

// Using the connection string from your .env file
const connectionString = "postgresql://019a6a48-4475-7868-b3fe-b6cda20c27dc:b4d6f70f-61cf-4080-ae48-a5461a521dbd@us-west-2.db.thenile.dev:5432/voteonit?sslmode=require";

const client = new Client({
  connectionString: connectionString,
  ssl: { 
    rejectUnauthorized: false // Required for some PostgreSQL providers
  }
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to the database...');
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('🕒 Database time:', res.rows[0].now);
    
    // Try to list tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('📋 Available tables:', tables.rows.map(row => row.table_name));
  } catch (err) {
    console.error('❌ Error connecting to the database:');
    console.error(err);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

testConnection();
