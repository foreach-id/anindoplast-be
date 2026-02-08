import { Request, Response, NextFunction } from 'express';
import { Logger } from '@utils/index';

class RequestLogger {
  /**
   * Log all incoming requests
   */
  static logRequest(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Log request
    Logger.request(req.method, req.originalUrl, req.ip || 'unknown');

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      Logger.debug('Request Details', {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        body: req.method !== 'GET' ? RequestLogger.sanitizeBody(req.body) : undefined,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

      if (res.statusCode >= 500) {
        Logger.error(logMessage);
      } else if (res.statusCode >= 400) {
        Logger.warn(logMessage);
      } else {
        Logger.info(logMessage);
      }
    });

    next();
  }

  /**
   * Sanitize request body (remove sensitive data from logs)
   */
  static sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'newPassword', 'oldPassword', 'confirmPassword', 'token', 'refreshToken'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * Log only errors
   */
  static logErrors(err: Error, req: Request, _res: Response, next: NextFunction): void {
    Logger.error('Request Error', {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
      ip: req.ip,
    });

    next(err);
  }
}

export default RequestLogger;
