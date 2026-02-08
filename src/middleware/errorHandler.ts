import { Request, Response, NextFunction } from 'express';
import { Logger } from '@utils/index';
import { statusCodes, errorCodes, messages } from '@constants/index';
import { Prisma } from '@prisma/client';

interface CustomError extends Error {
  statusCode?: number;
  errorCode?: number;
  code?: string;
}

class ErrorHandler {
  /**
   * Handle 404 - Not Found
   */
  static notFound(req: Request, _res: Response, next: NextFunction): void {
    const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = statusCodes.NOT_FOUND;
    error.errorCode = errorCodes.UNKNOWN_ERROR;
    next(error);
  }

  /**
   * Global error handler
   * Must be the last middleware
   */
  static handleError(err: CustomError, req: Request, res: Response, _next: NextFunction): Response {
    // Log error
    Logger.error('Error occurred', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    // Default error values
    let statusCode = err.statusCode || statusCodes.INTERNAL_SERVER_ERROR;
    let errorCode = err.errorCode || errorCodes.UNKNOWN_ERROR;
    let message = err.message || messages.ERROR.INTERNAL_SERVER;

    // Handle Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
      statusCode = statusCodes.BAD_REQUEST;
      errorCode = errorCodes.VALIDATION_ERROR;
      message = 'Validation error occurred';
    }

    // Handle Prisma unique constraint errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        statusCode = statusCodes.CONFLICT;
        errorCode = errorCodes.DUPLICATE_ENTRY;
        message = messages.ERROR.EMAIL_ALREADY_EXISTS;
      } else if (err.code === 'P2025') {
        statusCode = statusCodes.NOT_FOUND;
        errorCode = errorCodes.USER_NOT_FOUND;
        message = messages.ERROR.USER_NOT_FOUND;
      }
    }

    // Handle Prisma connection errors
    if (err instanceof Prisma.PrismaClientInitializationError) {
      statusCode = statusCodes.SERVICE_UNAVAILABLE;
      errorCode = errorCodes.DATABASE_ERROR;
      message = messages.ERROR.DATABASE_ERROR;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      statusCode = statusCodes.UNAUTHORIZED;
      errorCode = errorCodes.TOKEN_INVALID;
      message = messages.ERROR.TOKEN_INVALID;
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = statusCodes.UNAUTHORIZED;
      errorCode = errorCodes.TOKEN_EXPIRED;
      message = messages.ERROR.TOKEN_EXPIRED;
    }

    // Handle multer errors (if you use file upload later)
    if (err.name === 'MulterError') {
      statusCode = statusCodes.BAD_REQUEST;
      errorCode = errorCodes.VALIDATION_ERROR;
      message = `File upload error: ${err.message}`;
    }

    // Prepare error response
    const errorResponse: any = {
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.error = err;
    }

    // Send error response
    return res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle async errors
   * Wrapper function for async route handlers
   */
  static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

export default ErrorHandler;
