import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from './config/database';
import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start Express server - listen on all interfaces (0.0.0.0) to allow connections from emulators/devices
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📱 Accessible from emulator at http://10.0.2.2:${PORT}/api (Android)`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⚠️  Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

export default main;



