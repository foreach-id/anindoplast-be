import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { responseTemplates, statusCodes } from '../../constants';

export class AuthController {
  
  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'Login successful')
      );
    } catch (error: any) {
      return res.status(statusCodes.UNAUTHORIZED).json(
        responseTemplates.error(error.message)
      );
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const result = await AuthService.refreshToken(req.body);
      return res.status(statusCodes.OK).json(
        responseTemplates.success(result, 'Token refreshed successfully')
      );
    } catch (error: any) {
      return res.status(statusCodes.UNAUTHORIZED).json(
        responseTemplates.error(error.message)
      );
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (userId) {
        await AuthService.logout(userId);
      }
      return res.status(statusCodes.OK).json(
        responseTemplates.success(null, 'Logout successful')
      );
    } catch (error: any) {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(
        responseTemplates.error(error.message)
      );
    }
  }
}