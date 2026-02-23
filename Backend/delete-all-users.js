/**
 * Delete All Users Script
 * WARNING: This will delete ALL users from the database!
 */

const { Client } = require('pg');
require('dotenv').config();

async function deleteAllUsers() {
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

    // Count users before deletion
    const countBefore = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n📊 Users before deletion: ${countBefore.rows[0].count}`);

    if (countBefore.rows[0].count === '0') {
      console.log('ℹ️  No users to delete.');
      return;
    }

    // Delete all users
    console.log('\n🗑️  Deleting all users and related data...');
    
    // Delete in order to respect foreign key constraints
    await client.query('DELETE FROM tax_settings');
    console.log('  ✓ Deleted tax_settings');
    
    await client.query('DELETE FROM delivery_settings');
    console.log('  ✓ Deleted delivery_settings');
    
    await client.query('DELETE FROM user_permissions');
    console.log('  ✓ Deleted user_permissions');
    
    await client.query('DELETE FROM notifications');
    console.log('  ✓ Deleted notifications');
    
    await client.query('DELETE FROM subscriptions');
    console.log('  ✓ Deleted subscriptions');
    
    await client.query('DELETE FROM payment_methods');
    console.log('  ✓ Deleted payment_methods');
    
    await client.query('DELETE FROM addresses');
    console.log('  ✓ Deleted addresses');
    
    await client.query('DELETE FROM order_items');
    console.log('  ✓ Deleted order_items');
    
    await client.query('DELETE FROM orders');
    console.log('  ✓ Deleted orders');
    
    await client.query('DELETE FROM products');
    console.log('  ✓ Deleted products');
    
    await client.query('DELETE FROM stores');
    console.log('  ✓ Deleted stores');
    
    await client.query('DELETE FROM seller_registrations');
    console.log('  ✓ Deleted seller_registrations');
    
    await client.query('DELETE FROM events');
    console.log('  ✓ Deleted events');
    
    await client.query('DELETE FROM transactions');
    console.log('  ✓ Deleted transactions');
    
    await client.query('DELETE FROM delivery_locations');
    console.log('  ✓ Deleted delivery_locations');
    
    await client.query('DELETE FROM delivery_persons');
    console.log('  ✓ Deleted delivery_persons');
    
    await client.query('DELETE FROM seller_ratings');
    console.log('  ✓ Deleted seller_ratings');
    
    // Finally delete users
    const result = await client.query('DELETE FROM users');
    console.log(`  ✓ Deleted ${result.rowCount} users`);

    // Verify deletion
    const countAfter = await client.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Users after deletion: ${countAfter.rows[0].count}`);

    console.log('\n✅ All users deleted successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

deleteAllUsers();
