import 'reflect-metadata';
import { createServer } from 'http';
import { initializeDatabase, closeDatabase } from './config/database';
import app from './app';
import { TrackingService } from './services/tracking.service';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket tracking service
    new TrackingService(httpServer);
    console.log('📡 WebSocket tracking service initialized');

    // Start server - listen on all interfaces (0.0.0.0)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📍 GPS Tracking WebSocket ready`);
      console.log(`📱 Accessible from emulator at http://10.0.2.2:${PORT}/api (Android)`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n⚠️  Shutting down gracefully...');
      httpServer.close(() => {
        console.log('HTTP server closed');
      });
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

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
