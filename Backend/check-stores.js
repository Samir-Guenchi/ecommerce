const { AppDataSource } = require('./dist/config/database');
const { Store } = require('./dist/entities');

async function checkStores() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find();

    console.log('\nStores in database:');
    stores.forEach(store => {
      console.log(`- ID: ${store.id}, Name: ${store.name}, Domain: ${store.domain}, Status: ${store.status}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStores();
