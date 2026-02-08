import { Request, Response, NextFunction } from 'express';
import { TokenHelper, Logger } from '@utils/index';
import { UserRole } from '@prisma/client';
import { messages, statusCodes, errorCodes } from '@constants/index';
import prisma from '@config/prisma';
import { ITokenPayload } from '../types';

class AuthMiddleware {
  /**
   * Verify JWT token and authenticate user
   * Adds user object to req.user
   */
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          statusCode: statusCodes.UNAUTHORIZED,
          message: messages.ERROR.TOKEN_MISSING,
          errorCode: errorCodes.UNAUTHORIZED_ACCESS,
          timestamp: new Date().toISOString(),
        });
      }

      // Extract token
      const token = TokenHelper.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          statusCode: statusCodes.UNAUTHORIZED,
          message: messages.ERROR.TOKEN_INVALID,
          errorCode: errorCodes.TOKEN_INVALID,
          timestamp: new Date().toISOString(),
        });
      }

      // Verify token
      let decoded: ITokenPayload;
      try {
        decoded = TokenHelper.verifyAccessToken(token);
      } catch (error) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          statusCode: statusCodes.UNAUTHORIZED,
          message: messages.ERROR.TOKEN_EXPIRED,
          errorCode: errorCodes.TOKEN_EXPIRED,
          timestamp: new Date().toISOString(),
        });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          statusCode: statusCodes.UNAUTHORIZED,
          message: messages.ERROR.USER_NOT_FOUND,
          errorCode: errorCodes.USER_NOT_FOUND,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          statusCode: statusCodes.FORBIDDEN,
          message: messages.ERROR.ACCOUNT_LOCKED,
          errorCode: errorCodes.ACCOUNT_LOCKED,
          timestamp: new Date().toISOString(),
        });
      }

      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      Logger.debug('User authenticated', { userId: user.id, email: user.email });

      next();
    } catch (error) {
      Logger.error('Authentication middleware error', error);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        message: messages.ERROR.INTERNAL_SERVER,
        errorCode: errorCodes.UNKNOWN_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Check if user is admin
   * Must be used after authenticate middleware
   */
  static isAdmin(req: Request, res: Response, next: NextFunction): void | Response {
    try {
      if (!req.user) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          statusCode: statusCodes.UNAUTHORIZED,
          message: messages.ERROR.UNAUTHORIZED,
          errorCode: errorCodes.UNAUTHORIZED_ACCESS,
          timestamp: new Date().toISOString(),
        });
      }

      if (req.user.role !== UserRole.SUPER_ADMIN) {  
        Logger.warn('Non-super admin user tried to access admin route', {
          userId: req.user.id,
          role: req.user.role,
        });

        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          statusCode: statusCodes.FORBIDDEN,
          message: messages.ERROR.FORBIDDEN,
          errorCode: errorCodes.UNAUTHORIZED_ACCESS,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      Logger.error('isAdmin middleware error', error);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        message: messages.ERROR.INTERNAL_SERVER,
        errorCode: errorCodes.UNKNOWN_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Authorize based on user roles
   * Must be used after authenticate middleware
   */
  static authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
      try {
        if (!req.user) {
          return res.status(statusCodes.UNAUTHORIZED).json({
            success: false,
            statusCode: statusCodes.UNAUTHORIZED,
            message: messages.ERROR.UNAUTHORIZED,
            errorCode: errorCodes.UNAUTHORIZED_ACCESS,
            timestamp: new Date().toISOString(),
          });
        }

        if (!roles.includes(req.user.role)) {
          Logger.warn('User tried to access unauthorized route', {
            userId: req.user.id,
            role: req.user.role,
            requiredRoles: roles,
          });

          return res.status(statusCodes.FORBIDDEN).json({
            success: false,
            statusCode: statusCodes.FORBIDDEN,
            message: messages.ERROR.FORBIDDEN,
            errorCode: errorCodes.UNAUTHORIZED_ACCESS,
            timestamp: new Date().toISOString(),
          });
        }

        next();
      } catch (error) {
        Logger.error('Authorize middleware error', error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: messages.ERROR.INTERNAL_SERVER,
          errorCode: errorCodes.UNKNOWN_ERROR,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }

  /**
   * Optional authentication
   * Attaches user if token is valid, but doesn't reject if no token
   */
  static async optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next();
      }

      const token = TokenHelper.extractTokenFromHeader(authHeader);

      if (!token) {
        return next();
      }

      try {
        const decoded = TokenHelper.verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        }
      } catch (error) {
        // Token invalid or expired, but we don't reject the request
        Logger.debug('Optional auth: invalid token');
      }

      next();
    } catch (error) {
      Logger.error('Optional auth middleware error', error);
      next();
    }
  }
}

export default AuthMiddleware;
