import { Router } from 'express';
import { ProductCategoryController } from './productCategory.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all', ProductCategoryController.getAll);

export const productCategoryRoutes = router;
