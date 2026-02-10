import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@middleware/validateRequest';
import { authSchemas } from './auth.schema';
import AuthMiddleware from '@middleware/authMiddleware';

const router = Router();

// Endpoint Login
router.post(
  '/login',
  validate(authSchemas.login),
  AuthController.login
);

// Endpoint Refresh Token (token dibaca dari httpOnly cookie)
router.post(
  '/refresh-token',
  AuthController.refreshToken
);

// Endpoint Logout (Harus login dulu/bawa token)
router.post(
  '/logout',
  AuthMiddleware.authenticate,
  AuthController.logout
);

export const authRoutes = router;
