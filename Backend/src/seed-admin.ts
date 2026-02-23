import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User, AccountType, AccountStatus } from './entities/User';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@boutique.local' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists');
      console.log('📧 Email: admin@boutique.local');
      console.log('🔑 Password: admin123');
      
      // Update to ensure it's admin
      existingAdmin.isAdmin = true;
      existingAdmin.accountStatus = AccountStatus.ACTIVE;
      await userRepository.save(existingAdmin);
      console.log('✅ Admin account updated');
    } else {
      // Create admin account
      console.log('🔄 Creating admin account...');
      
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const admin = userRepository.create({
        email: 'admin@boutique.local',
        passwordHash,
        fullName: 'System Administrator',
        accountType: AccountType.BUYER, // Default type, but isAdmin flag is what matters
        accountStatus: AccountStatus.ACTIVE,
        isAdmin: true,
        languagePreference: 'en',
      });

      await userRepository.save(admin);
      
      console.log('✅ Admin account created successfully!');
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email: admin@boutique.local');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: Administrator');
      console.log('═══════════════════════════════════════');
    }

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
