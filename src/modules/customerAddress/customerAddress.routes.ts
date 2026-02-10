import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { customerAddressSchemas } from './customerAddress.schema';
import { CustomerAddressController } from './customerAddress.controller';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all/:id', CustomerAddressController.getAll);

router.get('/detail/:id', validate(customerAddressSchemas.idParam), CustomerAddressController.getById);

router.post('/create', validate(customerAddressSchemas.create), CustomerAddressController.create);

router.patch('/update/:id', validate(customerAddressSchemas.update), CustomerAddressController.update);

export const customerAddressRoutes = router;
