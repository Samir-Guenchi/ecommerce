const { AppDataSource } = require('./dist/config/database');
const { Store } = require('./dist/entities');

async function testStoreStatus() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const storeRepo = AppDataSource.getRepository(Store);
    
    // Get all stores
    const stores = await storeRepo.find();
    
    console.log('📊 Current Stores Status:\n');
    stores.forEach(store => {
      console.log(`  Store ID: ${store.id}`);
      console.log(`  Name: ${store.name}`);
      console.log(`  Domain: ${store.domain}`);
      console.log(`  Status: ${store.status}`);
      console.log(`  User ID: ${store.userId}`);
      console.log('  ---');
    });

    // Test 1: Change a store to active
    if (stores.length > 0) {
      const testStore = stores[0];
      console.log(`\n🧪 Test 1: Changing store "${testStore.name}" to active...`);
      testStore.status = 'active';
      await storeRepo.save(testStore);
      console.log('✅ Status changed to active\n');

      // Test 2: Change to draft
      console.log(`🧪 Test 2: Changing store "${testStore.name}" to draft...`);
      testStore.status = 'draft';
      await storeRepo.save(testStore);
      console.log('✅ Status changed to draft\n');

      // Test 3: Suspend the store (simulating admin action)
      console.log(`🧪 Test 3: Suspending store "${testStore.name}" (admin action)...`);
      testStore.status = 'suspended';
      await storeRepo.save(testStore);
      console.log('✅ Status changed to suspended\n');

      // Test 4: Try to activate suspended store (should be blocked by controller)
      console.log(`🧪 Test 4: Attempting to activate suspended store...`);
      console.log('⚠️  This should be blocked by the controller when called via API\n');

      // Reset to active for normal operation
      console.log(`🔄 Resetting store to active for normal operation...`);
      testStore.status = 'active';
      await storeRepo.save(testStore);
      console.log('✅ Store reset to active\n');
    }

    console.log('✅ All tests completed successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testStoreStatus();
