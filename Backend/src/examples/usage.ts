/**
 * Example usage of the database entities
 * This file demonstrates how to use TypeORM entities in your application
 */

import { AppDataSource } from '../config/database';
import {
  User,
  AccountType,
  AccountStatus,
  Store,
  StoreStatus,
  Product,
  ProductStatus,
  Order,
  OrderStatus,
} from '../entities';

// Example: Create a new user
export async function createUserExample() {
  const userRepository = AppDataSource.getRepository(User);

  const newUser = userRepository.create({
    email: 'user@example.com',
    passwordHash: 'hashed_password_here', // Use bcrypt in production
    fullName: 'John Doe',
    phone: '+213123456789',
    accountType: AccountType.BOTH,
    accountStatus: AccountStatus.PENDING,
    languagePreference: 'en',
  });

  const savedUser = await userRepository.save(newUser);
  console.log('Created user:', savedUser);
  return savedUser;
}

// Example: Create a store for a user
export async function createStoreExample(userId: number) {
  const storeRepository = AppDataSource.getRepository(Store);

  const newStore = storeRepository.create({
    userId,
    name: 'My Awesome Store',
    status: StoreStatus.DRAFT,
    location: 'Algiers',
    description: 'A great store for amazing products',
  });

  const savedStore = await storeRepository.save(newStore);
  console.log('Created store:', savedStore);
  return savedStore;
}

// Example: Create a product
export async function createProductExample(storeId: number) {
  const productRepository = AppDataSource.getRepository(Product);

  const newProduct = productRepository.create({
    storeId,
    name: 'Amazing Product',
    description: 'This is an amazing product',
    price: 99.99,
    stock: 100,
    status: ProductStatus.ACTIVE,
    category: 'Electronics',
  });

  const savedProduct = await productRepository.save(newProduct);
  console.log('Created product:', savedProduct);
  return savedProduct;
}

// Example: Query users with relations
export async function getUserWithStoresExample(userId: number) {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ['stores', 'stores.products'],
  });

  console.log('User with stores:', user);
  return user;
}

// Example: Create an order
export async function createOrderExample(
  userId: number,
  storeId: number,
  productId: number
) {
  const orderRepository = AppDataSource.getRepository(Order);
  const productRepository = AppDataSource.getRepository(Product);

  // Get product to get current price
  const product = await productRepository.findOne({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  const newOrder = orderRepository.create({
    orderNumber: `ORD-${Date.now()}`,
    userId,
    storeId,
    totalAmount: product.price,
    status: OrderStatus.PROCESSING,
    orderDate: new Date(),
  });

  const savedOrder = await orderRepository.save(newOrder);
  console.log('Created order:', savedOrder);
  return savedOrder;
}

// Example: Find all active products
export async function findActiveProductsExample() {
  const productRepository = AppDataSource.getRepository(Product);

  const activeProducts = await productRepository.find({
    where: { status: ProductStatus.ACTIVE },
    relations: ['store'],
  });

  console.log('Active products:', activeProducts);
  return activeProducts;
}

// Example: Update user
export async function updateUserExample(userId: number) {
  const userRepository = AppDataSource.getRepository(User);

  await userRepository.update(userId, {
    accountStatus: AccountStatus.ACTIVE,
    lastLogin: new Date(),
  });

  const updatedUser = await userRepository.findOne({ where: { id: userId } });
  console.log('Updated user:', updatedUser);
  return updatedUser;
}










