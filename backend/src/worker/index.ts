import 'reflect-metadata'; // Required for TypeORM
import dotenv from 'dotenv';
import { AppDataSource } from '../ormconfig';
import queueService from '../services/queue/queueService';

// Load environment variables
dotenv.config();

class WorkerService {
  private isShuttingDown = false;

  constructor() {
    this.setupSignalHandlers();
  }

  /**
   * Start the worker service
   */
  async start(): Promise<void> {
    console.log('🚀 Starting TexhPulze Worker Service...');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

    try {
      // Test Redis connection
      const redisConnected = await queueService.testConnection();
      if (!redisConnected) {
        throw new Error('Failed to connect to Redis');
      }

      // Initialize database connection
      console.log('🔌 Connecting to database...');
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');

      // Display configuration
      this.displayConfiguration();

      // Start queue monitoring
      await this.startQueueMonitoring();

      console.log('✅ Worker service started successfully');
      console.log('⏳ Waiting for jobs...');

      // Keep the process alive
      this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start worker service:', error);
      process.exit(1);
    }
  }

  /**
   * Display configuration information
   */
  private displayConfiguration(): void {
    console.log('\n📋 Configuration:');
    console.log(`   Database: ${AppDataSource.isInitialized ? 'Connected' : 'Disconnected'}`);
    console.log(`   Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
    console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`   Debug: ${process.env.DEBUG_SCORING === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log(`   Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    console.log('');
  }

  /**
   * Start queue monitoring
   */
  private async startQueueMonitoring(): Promise<void> {
    // Monitor queue stats every 30 seconds
    setInterval(async () => {
      try {
        const stats = await queueService.getQueueStats();
        console.log(`📊 Queue Stats - Waiting: ${stats.waiting}, Active: ${stats.active}, Completed: ${stats.completed}, Failed: ${stats.failed}`);
      } catch (error) {
        console.error('Error getting queue stats:', error);
      }
    }, 30000);

    // Clean queue every hour
    setInterval(async () => {
      try {
        await queueService.cleanQueue();
      } catch (error) {
        console.error('Error cleaning queue:', error);
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Keep the process alive
   */
  private keepAlive(): void {
    // Keep the process running
    const interval = setInterval(() => {
      if (this.isShuttingDown) {
        clearInterval(interval);
        return;
      }
      // Just keep the process alive
    }, 1000);
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        await this.shutdown();
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('🚨 Uncaught Exception:', error);
      await this.shutdown();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
      await this.shutdown();
    });
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log('🔄 Shutting down worker service...');

    try {
      // Close queue service
      console.log('🔌 Closing queue service...');
      await queueService.close();

      // Close database connection
      if (AppDataSource.isInitialized) {
        console.log('🔌 Closing database connection...');
        await AppDataSource.destroy();
      }

      console.log('✅ Worker service shut down successfully');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Health check endpoint (if running as HTTP server)
   */
  getHealthStatus(): {
    status: string;
    timestamp: string;
    uptime: number;
    redis: boolean;
    database: boolean;
    queue: any;
  } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: true, // This would need actual Redis health check
      database: AppDataSource.isInitialized,
      queue: {
        // This would need actual queue stats
        active: 0,
        waiting: 0
      }
    };
  }
}

// Start the worker service
const workerService = new WorkerService();

// Handle development vs production
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Running in development mode');
}

// Start the worker
workerService.start().catch((error) => {
  console.error('💥 Failed to start worker:', error);
  process.exit(1);
});

// Export for testing
export default workerService;


