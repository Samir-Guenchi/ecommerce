import { AppDataSource } from './config/database';
import { Product } from './entities/Product';
import { Store } from './entities/Store';
import { User } from './entities/User';

const PRODUCT_IMAGES: Record<string, string> = {
  'Tapis Berbère Babar Traditionnel': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
  'Service à Thé Cuivre Gravé Algérois': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  'Burnous Blanc en Laine Pure': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  'Huile d’Olive Extra Vierge Kabylie (5L)': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  'Smartphone DZ Pro Max 5G (128GB)': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'Écouteurs Sans Fil Wireless Pro ANC': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  'Montre Connectée Sport DZ Fit': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'Chargeur Rapide 65W GaN Dual USB-C': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
};

async function updateImages() {
  await AppDataSource.initialize();
  const productRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);
  const storeRepo = AppDataSource.getRepository(Store);

  const user = await userRepo.findOne({ where: { email: 'samir.guenchi@ensia.edu.dz' } });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const stores = await storeRepo.find({ where: { userId: user.id } });
  const storeIds = stores.map(s => s.id);
  console.log(`Found stores for user: ${storeIds.join(', ')}`);

  const products = await productRepo.find();
  for (const product of products) {
    let matchedImg: string | undefined = undefined;
    for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
      if (product.name.toLowerCase().includes(key.substring(0, 10).toLowerCase()) || key.toLowerCase().includes(product.name.substring(0, 10).toLowerCase())) {
        matchedImg = url;
        break;
      }
    }
    // Also match generic fallbacks if specific didn't hit
    if (!matchedImg) {
      if (product.name.toLowerCase().includes('tapis')) matchedImg = PRODUCT_IMAGES['Tapis Berbère Babar Traditionnel'];
      else if (product.name.toLowerCase().includes('thé') || product.name.toLowerCase().includes('cuivre')) matchedImg = PRODUCT_IMAGES['Service à Thé Cuivre Gravé Algérois'];
      else if (product.name.toLowerCase().includes('burnous')) matchedImg = PRODUCT_IMAGES['Burnous Blanc en Laine Pure'];
      else if (product.name.toLowerCase().includes('huile')) matchedImg = PRODUCT_IMAGES['Huile d’Olive Extra Vierge Kabylie (5L)'];
      else if (product.name.toLowerCase().includes('phone') || product.name.toLowerCase().includes('smartphone')) matchedImg = PRODUCT_IMAGES['Smartphone DZ Pro Max 5G (128GB)'];
      else if (product.name.toLowerCase().includes('écouteur') || product.name.toLowerCase().includes('audio')) matchedImg = PRODUCT_IMAGES['Écouteurs Sans Fil Wireless Pro ANC'];
      else if (product.name.toLowerCase().includes('montre') || product.name.toLowerCase().includes('watch')) matchedImg = PRODUCT_IMAGES['Montre Connectée Sport DZ Fit'];
      else if (product.name.toLowerCase().includes('chargeur')) matchedImg = PRODUCT_IMAGES['Chargeur Rapide 65W GaN Dual USB-C'];
    }

    if (matchedImg) {
      product.imagePath = matchedImg;
      await productRepo.save(product);
      console.log(`Updated product #${product.id} "${product.name}" -> ${matchedImg.substring(0, 50)}...`);
    } else {
      console.log(`No match for product #${product.id} "${product.name}"`);
    }
  }

  console.log('Finished updating product images.');
  process.exit(0);
}

updateImages().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
