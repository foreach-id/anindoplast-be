// src/modules/order/order.routes.ts
import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { orderSchemas } from './order.schema';
import { UserRole } from '@prisma/client';
import { OrderController } from './order.controller';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.post('/paginated', validate(orderSchemas.queryParams), OrderController.getPaginated);

router.get('/detail/:id', validate(orderSchemas.idParam), OrderController.getById);

router.post('/create', validate(orderSchemas.create), OrderController.create);

router.patch('/update/:id', validate(orderSchemas.update), OrderController.update);

router.delete('/delete/:id', validate(orderSchemas.idParam), OrderController.delete);

export const orderRoutes = router;
