import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { paymentMethodSchemas } from './paymentMethod.schema';
import { UserRole } from '@prisma/client';
import { PaymentMethodController } from './paymentMethod.controller';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all', PaymentMethodController.getAll);

router.get('/paginated', validate(paymentMethodSchemas.queryParams), PaymentMethodController.getPaginated);

router.get('/detail/:id', validate(paymentMethodSchemas.idParam), PaymentMethodController.getById);

router.post('/create', validate(paymentMethodSchemas.create), PaymentMethodController.create);

router.patch('/update/:id', validate(paymentMethodSchemas.update), PaymentMethodController.update);

router.patch('/change_status/:id', validate(paymentMethodSchemas.idParam), PaymentMethodController.changeStatus);

router.delete('/delete/:id', validate(paymentMethodSchemas.idParam), PaymentMethodController.delete);
export const paymentMethodRoutes = router;
