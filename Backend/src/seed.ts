import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from './config/database';
import { AppDataSource } from './config/database';
import { User, AccountType, AccountStatus } from './entities/User';
import { Store, StoreStatus } from './entities/Store';
import { Product, ProductStatus } from './entities/Product';
import * as bcrypt from 'bcrypt';

async function seed() {
    try {
        console.log('🌱 Starting database seed...');

        // Initialize database
        await initializeDatabase();

        const userRepo = AppDataSource.getRepository(User);
        const storeRepo = AppDataSource.getRepository(Store);
        const productRepo = AppDataSource.getRepository(Product);

        // Create demo seller account
        console.log('👤 Creating demo seller...');
        const hashedPassword = await bcrypt.hash('demo123', 10);

        const seller = userRepo.create({
            email: 'demo@algeriepost.dz',
            passwordHash: hashedPassword,
            fullName: 'Boutique Traditional Algérienne',
            phone: '+213 555 123 456',
            accountType: AccountType.SELLER,
            accountStatus: AccountStatus.ACTIVE,
            languagePreference: 'fr',
        });
        await userRepo.save(seller);
        console.log('✅ Seller created:', seller.email);

        // Create demo store
        console.log('🏪 Creating demo store...');
        const store = storeRepo.create({
            userId: seller.id,
            name: 'Boutique Traditional',
            status: StoreStatus.ACTIVE,
            location: 'Alger, Algérie',
            description: 'Découvrez nos produits traditionnels algériens de qualité supérieure',
            domain: 'demo',
        });
        await storeRepo.save(store);
        console.log('✅ Store created:', store.name, '(domain: demo)');

        // Create demo products
        console.log('📦 Creating demo products...');

        const products = [
            {
                storeId: store.id,
                name: 'Tapis Berbère Traditionnel',
                description: 'Magnifique tapis berbère fait main avec des motifs traditionnels. Taille: 200x150cm',
                price: 25000,
                stock: 5,
                status: ProductStatus.ACTIVE,
                category: 'Décoration',
                imagePath: null,
            },
            {
                storeId: store.id,
                name: 'Poterie Kabyle Artisanale',
                description: 'Poterie traditionnelle kabyle décorée à la main. Pièce unique.',
                price: 8500,
                stock: 12,
                status: ProductStatus.ACTIVE,
                category: 'Artisanat',
                imagePath: null,
            },
            {
                storeId: store.id,
                name: 'Bijoux en Argent de Tlemcen',
                description: 'Collier en argent massif avec motifs géométriques traditionnels',
                price: 15000,
                stock: 8,
                status: ProductStatus.ACTIVE,
                category: 'Bijoux',
                imagePath: null,
            },
            {
                storeId: store.id,
                name: 'Gandoura Brodée',
                description: 'Gandoura blanche brodée main, disponible en plusieurs tailles',
                price: 12000,
                stock: 15,
                status: ProductStatus.ACTIVE,
                category: 'Vêtements',
                imagePath: null,
            },
            {
                storeId: store.id,
                name: 'Service à Thé Marocain',
                description: 'Service complet pour 6 personnes avec plateau gravé',
                price: 18000,
                stock: 6,
                status: ProductStatus.ACTIVE,
                category: 'Cuisine',
                imagePath: null,
            },
            {
                storeId: store.id,
                name: 'Babouches en Cuir',
                description: 'Babouches artisanales en cuir véritable, confortables et élégantes',
                price: 4500,
                stock: 20,
                status: ProductStatus.ACTIVE,
                category: 'Chaussures',
                imagePath: null,
            },
        ];

        for (const productData of products) {
            const product = productRepo.create(productData);
            await productRepo.save(product);
            console.log(`  ✅ Created: ${product.name} - ${product.price} DA`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📍 Access your store at:');
        console.log('   http://localhost:5173/?domain=demo');
        console.log('\n🔐 Login credentials:');
        console.log('   Email: demo@algeriepost.dz');
        console.log('   Password: demo123');
        console.log('\n💡 Start the servers:');
        console.log('   Backend:    cd Backend && npm run dev');
        console.log('   Storefront: cd Storefront && npm run dev');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await closeDatabase();
    }
}

// Run seed
seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
