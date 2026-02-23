import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import app from './app';
import config from '@config/index';
import { Logger } from '@utils/index';
import prisma from '@config/prisma';
import 'module-alias/register'

// Load environment variables
dotenv.config();

const PORT = config.app.port;

// Test database connection
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        Logger.success('Database connected successfully');
    } catch (error) {
        Logger.error('Database connection failed', error);
        process.exit(1);
    }
}

// Start server
async function startServer() {
    try {
        // Test database connection first
        await testDatabaseConnection();

        // Start Express server
        app.listen(PORT, () => {
            Logger.success(`Server running in ${config.app.env} mode`);
            Logger.success(`Server is listening on port ${PORT}`);
            Logger.info(`API URL: http://localhost:${PORT}/api`);
            Logger.info(`Health Check: http://localhost:${PORT}/health`);
            Logger.info(`Started at: ${new Date().toLocaleString()}`);

            if (config.app.env === 'development') {
                Logger.debug('Development mode - Detailed logging enabled');
            }
        });
    } catch (error) {
        Logger.error('Failed to start server', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    Logger.error('UNHANDLED REJECTION! Shutting down...', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    Logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    Logger.info('SIGTERM received. Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    Logger.info('SIGINT received. Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

// Start the server
startServer();
