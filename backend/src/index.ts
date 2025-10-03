import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { config } from 'dotenv';
import { DatabaseManager, Logger } from '../../shared/dist/index';
import { authRoutes } from './routes/auth';
import { guildRoutes } from './routes/guilds';
import { moduleRoutes } from './routes/modules';
import { statsRoutes } from './routes/stats';

config();

export class TheTribeAPI {
  public app: express.Application;
  public database: DatabaseManager;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');

    this.database = new DatabaseManager(
      process.env.MONGODB_URI || 'mongodb://localhost:27017',
      process.env.DB_NAME || 'thetribe'
    );

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Trust proxy for Nginx Proxy Manager
    this.app.set('trust proxy', 1);

    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Sessions
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL?.startsWith('https'),
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/guilds', guildRoutes);
    this.app.use('/api/modules', moduleRoutes);
    this.app.use('/api/stats', statsRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      Logger.error('API Error:', error);

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();

      this.app.listen(this.port, () => {
        Logger.info(`TheTribe API server running on port ${this.port}`);
        Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      Logger.error('Failed to start API server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    Logger.info('Shutting down API server...');
    await this.database.disconnect();
    process.exit(0);
  }
}

// Start the API if this file is run directly
if (require.main === module) {
  const api = new TheTribeAPI();

  process.on('SIGINT', () => api.shutdown());
  process.on('SIGTERM', () => api.shutdown());

  api.start();
}