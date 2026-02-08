import { Router } from 'express';
import { UserController } from './user.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
// PERBAIKAN 1: Import fungsi 'validate' langsung
import { validate } from '../../middleware/validateRequest'; 
import { userSchemas } from './user.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// ==========================================
// 1. PUBLIC / SHARED ROUTES (Semua User Login)
// ==========================================
router.use(AuthMiddleware.authenticate);

// Get Profile sendiri
router.get('/profile', UserController.getProfile);

// Update Profile sendiri
router.patch(
  '/profile',
  // PERBAIKAN 2: Langsung panggil 'validate()' tanpa 'ValidateRequest.'
  validate(userSchemas.updateProfile),
  UserController.updateProfile
);

// ==========================================
// 2. SUPER ADMIN ONLY ROUTES
// ==========================================
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN]));

router.post(
  '/',
  validate(userSchemas.createUser),
  UserController.createUser
);

router.get(
  '/',
  validate(userSchemas.queryParams),
  UserController.getUsers
);

router.get(
  '/:id',
  validate(userSchemas.userIdParam),
  UserController.getUser
);

router.patch(
  '/:id',
  validate(userSchemas.updateUser),
  UserController.updateUser
);

// Route Restore (Yang kita bahas sebelumnya)
router.patch(
  '/:id/restore',
  validate(userSchemas.userIdParam),
  UserController.restoreUser
);

router.delete(
  '/:id',
  validate(userSchemas.userIdParam),
  UserController.deleteUser
);

export const userRoutes = router;