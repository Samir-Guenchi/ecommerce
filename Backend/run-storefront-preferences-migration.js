const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'algerie_post_ecom',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-storefront-preferences.sql'),
      'utf8'
    );

    console.log('Running migration: add-storefront-preferences.sql');
    await client.query(migrationSQL);
    console.log('✓ Migration completed successfully');

    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'stores' 
      AND column_name IN ('storefront_theme', 'storefront_language')
      ORDER BY column_name;
    `);

    console.log('\n✓ Verified new columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

runMigration();
