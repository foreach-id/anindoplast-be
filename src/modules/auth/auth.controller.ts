import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { responseTemplates, statusCodes } from '../../constants';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../utils/cookieHelper';

export class AuthController {

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      // Set refresh token as httpOnly cookie
      setRefreshTokenCookie(res, result.refreshToken);

      // Return response without refreshToken in body
      return res.status(statusCodes.OK).json(
        responseTemplates.success(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          'Login successful'
        )
      );
    } catch (error: any) {
      return res.status(statusCodes.UNAUTHORIZED).json(
        responseTemplates.error(error.message)
      );
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const token = req.cookies?.refresh_token;

      if (!token) {
        return res.status(statusCodes.UNAUTHORIZED).json(
          responseTemplates.error('Refresh token is required')
        );
      }

      const result = await AuthService.refreshToken(token);

      // Set new refresh token as httpOnly cookie
      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(statusCodes.OK).json(
        responseTemplates.success(
          { accessToken: result.accessToken },
          'Token refreshed successfully'
        )
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

      // Clear refresh token cookie
      clearRefreshTokenCookie(res);

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
