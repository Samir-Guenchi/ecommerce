const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'algerie_post_ecom',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    const migrationPath = path.join(__dirname, 'migrations', 'add-suspension-fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running suspension fields migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

    console.log('\n📊 Verifying new columns...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('suspension_reason', 'suspended_at', 'suspended_by_id', 'deletion_reason', 'deleted_at', 'deleted_by_id')
      ORDER BY column_name;
    `);

    if (result.rows.length > 0) {
      console.log('✅ New columns added:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('⚠️  Warning: Could not verify new columns');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();
