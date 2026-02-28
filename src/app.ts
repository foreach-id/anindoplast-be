import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from '@config/index';
import { ErrorHandler, RequestLogger } from '@middleware/index';
import apiRoutes from './routes/index';

// Create Express app
const app: Application = express();

// Trust proxy (if behind reverse proxy like nginx)
app.set('trust proxy', 1);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Request logger
app.use(RequestLogger.logRequest);

// Security headers
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'order mgmt API',
    version: '1.0.0',
    architecture: 'Modular',
    description: 'Professional REST API for order mgmt Application',
    endpoints: {
      root: '/',
      health: '/health',
      api: '/api',
      documentation: 'https://docs.ordermgmt.com', // future
    },
    developer: {
      name: 'Hidup Joekoewie',
      email: 'kaesang2029@ordermgmt.com',
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler (must be after all routes)
app.use(ErrorHandler.notFound);

// Global error handler (must be last)
app.use(ErrorHandler.handleError);

export default app;
