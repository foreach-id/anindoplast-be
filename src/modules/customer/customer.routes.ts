import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { customerSchemas } from './customer.schema';
import { UserRole } from '@prisma/client';
import { CustomerController } from './customer.controller';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all', CustomerController.getAll);

router.get('/paginated', validate(customerSchemas.queryParams), CustomerController.getPaginated);

router.get('/detail/:id', validate(customerSchemas.idParam), CustomerController.getById);

router.post('/create', validate(customerSchemas.create), CustomerController.create);

router.patch('/update/:id', validate(customerSchemas.update), CustomerController.update);

export const customerRoutes = router;
