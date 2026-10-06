import { AppDataSource } from './config/database';
import { User, AccountType } from './entities/User';
import { Store, StoreStatus } from './entities/Store';
import { Product, ProductStatus } from './entities/Product';
import { Order, OrderStatus } from './entities/Order';

async function seedData() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const storeRepo = AppDataSource.getRepository(Store);
  const productRepo = AppDataSource.getRepository(Product);
  const orderRepo = AppDataSource.getRepository(Order);

  const email = 'samir.guenchi@ensia.edu.dz';
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  console.log(`👤 Seeding demo data for seller: ${user.fullName} (${user.email}) [ID: ${user.id}]`);

  // 1. Ensure 2 Active Stores
  let store1 = await storeRepo.findOne({ where: { userId: user.id, domain: 'samir-boutique' } });
  if (!store1) {
    store1 = storeRepo.create({
      userId: user.id,
      name: 'Boutique Samir Guenchi',
      status: StoreStatus.ACTIVE,
      location: 'Alger Centre, Algérie',
      description: 'Artisanat traditionnel d’exception & créations algériennes authentiques',
      domain: 'samir-boutique',
    });
    await storeRepo.save(store1);
  } else {
    store1.status = StoreStatus.ACTIVE;
    await storeRepo.save(store1);
  }

  let store2 = await storeRepo.findOne({ where: { userId: user.id, domain: 'samir-tech-dz' } });
  if (!store2) {
    store2 = storeRepo.create({
      userId: user.id,
      name: 'Alger Tech Express',
      status: StoreStatus.ACTIVE,
      location: 'Bab Ezzouar, Alger',
      description: 'High-Tech, accessoires connectés et smartphones certifiés Algérie Poste',
      domain: 'samir-tech-dz',
    });
    await storeRepo.save(store2);
  } else {
    store2.status = StoreStatus.ACTIVE;
    await storeRepo.save(store2);
  }
  console.log(`✅ Stores ready: "${store1.name}" (ID ${store1.id}), "${store2.name}" (ID ${store2.id})`);

  // 2. Add Products for both stores
  const productsToSeed = [
    {
      storeId: store1.id,
      name: 'Tapis Berbère Babar Traditionnel',
      description: 'Tapis berbère pure laine tissé main par des artisanes de Ghardaïa. 200x150cm.',
      price: 28500,
      stock: 14,
      status: ProductStatus.ACTIVE,
      category: 'Artisanat',
      imagePath: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store1.id,
      name: 'Service à Thé Cuivre Gravé Algérois',
      description: 'Plateau martelé artisanal avec théière traditionnelle et 6 verres dorés.',
      price: 9800,
      stock: 22,
      status: ProductStatus.ACTIVE,
      category: 'Maison',
      imagePath: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store1.id,
      name: 'Burnous Blanc en Laine Pure',
      description: 'Burnous traditionnel haut de gamme avec broderie fine au col.',
      price: 24000,
      stock: 9,
      status: ProductStatus.ACTIVE,
      category: 'Mode Traditionnelle',
      imagePath: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store1.id,
      name: 'Huile d’Olive Extra Vierge Kabylie (5L)',
      description: 'Première pression à froid, terroir Vallée de la Soummam.',
      price: 6500,
      stock: 35,
      status: ProductStatus.ACTIVE,
      category: 'Terroir',
      imagePath: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store2.id,
      name: 'Smartphone DZ Pro Max 5G (128GB)',
      description: 'Écran AMOLED 120Hz, triple capteur photo, compatible réseaux Algérie Télécom.',
      price: 49900,
      stock: 18,
      status: ProductStatus.ACTIVE,
      category: 'Téléphonie',
      imagePath: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store2.id,
      name: 'Écouteurs Sans Fil Wireless Pro ANC',
      description: 'Réduction active du bruit, autonomie 28h avec boîtier de charge rapide.',
      price: 5200,
      stock: 40,
      status: ProductStatus.ACTIVE,
      category: 'Audio',
      imagePath: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store2.id,
      name: 'Montre Connectée Sport DZ Fit',
      description: 'Capteur cardiaque, GPS intégré, étanche 50m et autonomie 10 jours.',
      price: 8900,
      stock: 25,
      status: ProductStatus.ACTIVE,
      category: 'Accessoires',
      imagePath: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      storeId: store2.id,
      name: 'Chargeur Rapide 65W GaN Dual USB-C',
      description: 'Technologie GaN compacte pour recharge ultra-rapide smartphone et PC portable.',
      price: 3800,
      stock: 50,
      status: ProductStatus.ACTIVE,
      category: 'Accessoires',
      imagePath: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const p of productsToSeed) {
    const existing = await productRepo.findOne({ where: { storeId: p.storeId, name: p.name } });
    if (!existing) {
      await productRepo.save(productRepo.create(p));
    }
  }
  const totalProducts = await productRepo.count({ where: { storeId: store1.id } }) +
                        await productRepo.count({ where: { storeId: store2.id } });
  console.log(`✅ Products ready: ${totalProducts} products available`);

  // 3. Add Orders distributed over the last 7 days for rich Weekly Activity Plot
  const buyer = await userRepo.findOne({ where: { accountType: AccountType.BUYER } }) || user;
  const buyerId = buyer.id;

  const now = new Date();
  const sampleOrders = [
    // Today (Day 0)
    { daysAgo: 0, amount: 28500, status: OrderStatus.PROCESSING, storeId: store1.id, num: 'AP-CMD-701' },
    { daysAgo: 0, amount: 5200, status: OrderStatus.PROCESSING, storeId: store2.id, num: 'AP-CMD-702' },
    { daysAgo: 0, amount: 9800, status: OrderStatus.SHIPPED, storeId: store1.id, num: 'AP-CMD-703' },
    // Yesterday (Day -1)
    { daysAgo: 1, amount: 49900, status: OrderStatus.SHIPPED, storeId: store2.id, num: 'AP-CMD-601' },
    { daysAgo: 1, amount: 6500, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-602' },
    { daysAgo: 1, amount: 8900, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-603' },
    { daysAgo: 1, amount: 3800, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-604' },
    // 2 days ago (Day -2)
    { daysAgo: 2, amount: 24000, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-501' },
    { daysAgo: 2, amount: 13000, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-502' },
    { daysAgo: 2, amount: 5200, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-503' },
    // 3 days ago (Day -3)
    { daysAgo: 3, amount: 49900, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-401' },
    { daysAgo: 3, amount: 9800, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-402' },
    { daysAgo: 3, amount: 8900, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-403' },
    { daysAgo: 3, amount: 6500, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-404' },
    { daysAgo: 3, amount: 3800, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-405' },
    // 4 days ago (Day -4)
    { daysAgo: 4, amount: 28500, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-301' },
    { daysAgo: 4, amount: 5200, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-302' },
    // 5 days ago (Day -5)
    { daysAgo: 5, amount: 24000, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-201' },
    { daysAgo: 5, amount: 49900, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-202' },
    { daysAgo: 5, amount: 9800, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-203' },
    { daysAgo: 5, amount: 6500, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-204' },
    // 6 days ago (Day -6)
    { daysAgo: 6, amount: 8900, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-101' },
    { daysAgo: 6, amount: 3800, status: OrderStatus.DELIVERED, storeId: store2.id, num: 'AP-CMD-102' },
    { daysAgo: 6, amount: 13000, status: OrderStatus.DELIVERED, storeId: store1.id, num: 'AP-CMD-103' },
  ];

  for (const ord of sampleOrders) {
    const existing = await orderRepo.findOne({ where: { orderNumber: ord.num } });
    const orderDate = new Date(now.getTime() - ord.daysAgo * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000);
    if (!existing) {
      const o = orderRepo.create({
        orderNumber: ord.num,
        userId: buyerId,
        storeId: ord.storeId,
        totalAmount: ord.amount,
        status: ord.status,
        orderDate,
        trackingNumber: `DZ-POST-${ord.num}`,
      });
      await orderRepo.save(o);
    } else {
      existing.orderDate = orderDate;
      existing.totalAmount = ord.amount;
      existing.status = ord.status;
      await orderRepo.save(existing);
    }
  }

  const finalOrders = await orderRepo.find({
    where: [{ storeId: store1.id }, { storeId: store2.id }],
  });
  const totalRev = finalOrders.reduce((sum, o) => sum + parseFloat(String(o.totalAmount || 0)), 0);

  console.log(`🎉 Demo data populated successfully!`);
  console.log(`📊 Total Stores: 2`);
  console.log(`📦 Total Products: ${totalProducts}`);
  console.log(`🛒 Total Orders: ${finalOrders.length}`);
  console.log(`💰 Total Revenue: ${totalRev.toLocaleString()} DZD`);

  process.exit(0);
}

seedData().catch(e => {
  console.error(e);
  process.exit(1);
});
