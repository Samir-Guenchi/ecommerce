const { Client } = require('pg');
require('dotenv').config();

async function checkAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'algerie_post_ecom',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if admin user exists
    const result = await client.query(`
      SELECT id, email, full_name, account_type, account_status, is_admin
      FROM users 
      WHERE email = 'admin@boutique.local'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user NOT found in database');
      console.log('📝 Need to create admin user');
    } else {
      console.log('✅ Admin user found:');
      console.log(result.rows[0]);
    }
    
    // Check all admin users
    const allAdmins = await client.query(`
      SELECT id, email, full_name, account_type, is_admin
      FROM users 
      WHERE is_admin = true
    `);
    
    console.log('\n📋 All admin users in database:');
    if (allAdmins.rows.length === 0) {
      console.log('❌ No admin users found');
    } else {
      allAdmins.rows.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.full_name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkAdmin();
