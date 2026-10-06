const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createTestUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'algerie_post_ecom',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test user credentials - you can modify these
    const users = [
      { email: 'test@example.com', password: 'Test123456', fullName: 'Test User', accountType: 'buyer' },
      { email: 'buyer@test.com', password: 'Test123456', fullName: 'Test Buyer', accountType: 'buyer' },
      { email: 'seller@test.com', password: 'Test123456', fullName: 'Test Seller', accountType: 'seller' },
      { email: 'both@test.com', password: 'Test123456', fullName: 'Buyer & Seller', accountType: 'both' },
    ];
    
    // First check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const userTable = tablesResult.rows.find(r => 
      r.table_name === 'user' || r.table_name === 'users'
    );
    
    if (!userTable) {
      console.log('❌ No user table found.');
      return;
    }
    
    const tableName = userTable.table_name;
    console.log('✅ Using table:', tableName);
    
    // Create multiple test users
    for (const userData of users) {
      const { email, password, fullName, accountType } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if user already exists
      const checkResult = await client.query(
        `SELECT * FROM "${tableName}" WHERE email = $1`,
        [email]
      );

      if (checkResult.rows.length > 0) {
        console.log(`\n⚠️  User already exists: ${email}`);
      } else {
        // Create new user
        await client.query(
          `INSERT INTO "${tableName}" (
            email, 
            full_name, 
            password_hash, 
            account_type, 
            account_status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [email, fullName, hashedPassword, accountType, 'active']
        );

        console.log(`\n✅ Created: ${email} (${accountType})`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All test users ready!');
    console.log('='.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS (All passwords: Test123456):\n');
    users.forEach(u => {
      console.log(`📧 ${u.email.padEnd(25)} 👤 ${u.accountType.toUpperCase()}`);
    });
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestUsers();
