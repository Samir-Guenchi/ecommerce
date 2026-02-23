const { AppDataSource } = require('./dist/config/database');
const { Store } = require('./dist/entities');

async function activateStore() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const storeRepo = AppDataSource.getRepository(Store);
    const store = await storeRepo.findOne({ where: { domain: 'samir-store.algeriepost.dz' } });

    if (!store) {
      console.log('Store not found');
      await AppDataSource.destroy();
      return;
    }

    console.log(`Current status: ${store.status}`);
    store.status = 'active';
    await storeRepo.save(store);
    console.log('Store activated successfully!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

activateStore();
