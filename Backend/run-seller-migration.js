/**
 * Fix Seller Registration Columns Migration
 * Makes ssid and business_id nullable
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'algerie_post_ecom',
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database:', process.env.DB_DATABASE);

    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'fix-seller-registration-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Running migration to fix seller_registrations columns...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ ssid and business_id columns are now nullable');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();
