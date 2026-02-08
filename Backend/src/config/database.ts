import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import all entities
import {
  User,
  Plan,
  Theme,
  SellerRegistration,
  Store,
  Product,
  Address,
  Order,
  OrderItem,
  PaymentMethod,
  Subscription,
  Notification,
  Event,
  TrackingSystem,
  TaxSetting,
  DeliverySetting,
  UserPermission,
  Transaction,
} from '../entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'algerie_post_ecom',
  entities: [
    User,
    Plan,
    Theme,
    SellerRegistration,
    Store,
    Product,
    Address,
    Order,
    OrderItem,
    PaymentMethod,
    Subscription,
    Notification,
    Event,
    TrackingSystem,
    TaxSetting,
    DeliverySetting,
    UserPermission,
    Transaction,
  ],
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create DataSource instance
export const AppDataSource = new DataSource(dataSourceOptions);

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export default AppDataSource;

