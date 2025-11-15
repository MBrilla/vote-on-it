const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // List all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTables in the database:');
    for (const row of tablesRes.rows) {
      console.log(`\nTable: ${row.table_name}`);
      
      // Get column info for each table
      const columnsRes = await client.query({
        text: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `,
        values: [row.table_name]
      });

      console.log('Columns:');
      console.table(columnsRes.rows);

      // Get index info for each table
      const indexesRes = await client.query({
        text: `
          SELECT 
            i.relname as index_name,
            a.attname as column_name,
            ix.indisunique as is_unique,
            ix.indisprimary as is_primary
          FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a
          WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND t.relname = $1
          ORDER BY
            t.relname,
            i.relname;
        `,
        values: [row.table_name]
      });

      if (indexesRes.rows.length > 0) {
        console.log('Indexes:');
        console.table(indexesRes.rows);
      } else {
        console.log('No indexes found for this table');
      }
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
  }
}

checkDatabase();
