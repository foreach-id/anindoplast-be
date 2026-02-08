import { Request, Response } from 'express';
import { UserService } from './user.service';
import { responseTemplates, statusCodes } from '../../constants';

export class UserController {
  
  // --- Create User (Super Admin Only) ---
  static async createUser(req: Request, res: Response) {
    try {
      const result = await UserService.createUser(req.body);
      return res.status(statusCodes.CREATED).json(
        responseTemplates.success(result, 'User created successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Get List Users (Super Admin Only) ---
  static async getUsers(req: Request, res: Response) {
    try {
      // req.query sudah divalidasi dan di-transform oleh Zod schema
      const result = await UserService.getUsers(req.query as any);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'Users list retrieved successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Get Specific User ---
  static async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserById(Number(id));
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'User retrieved successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.NOT_FOUND).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Update User (Super Admin Only) ---
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserService.updateUser(Number(id), req.body);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'User updated successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Deactivate User ---
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(Number(id));
      return res.status(statusCodes.OK).json(
        responseTemplates.success(null, 'User deactivated successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Get Own Profile ---
  static async getProfile(req: Request, res: Response) {
    try {
      // req.user.id berasal dari AuthMiddleware
      const userId = req.user?.id;
      if (!userId) throw new Error('User context missing');

      const result = await UserService.getUserById(userId);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'My profile retrieved successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.UNAUTHORIZED).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Update Own Profile ---
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User context missing');

      // User biasa tidak boleh ganti role atau isActive
      const { role, isActive, ...allowedData } = req.body;

      const result = await UserService.updateUser(userId, allowedData);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'Profile updated successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).json(
        responseTemplates.error(error.message)
      );
    }
  }

  // --- Restore User (Super Admin Only) ---
  static async restoreUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserService.restoreUser(Number(id));
      
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'User restored successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).json(
        responseTemplates.error(error.message)
      );
    }
  }
}