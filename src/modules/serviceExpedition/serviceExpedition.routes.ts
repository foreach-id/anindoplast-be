import { Router } from 'express';
import { ServiceExpeditionController } from './serviceExpedition.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { serviceExpeditionSchemas } from './serviceExpedition.schema';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all_by_expedition/:id', ServiceExpeditionController.getAll);

router.get('/detail/:id', validate(serviceExpeditionSchemas.idParam), ServiceExpeditionController.getById);

router.post('/create', validate(serviceExpeditionSchemas.create), ServiceExpeditionController.create);

router.patch('/update/:id', validate(serviceExpeditionSchemas.update), ServiceExpeditionController.update);

router.patch('/change_status/:id', validate(serviceExpeditionSchemas.idParam), ServiceExpeditionController.changeStatus);

router.delete('/delete/:id', validate(serviceExpeditionSchemas.idParam), ServiceExpeditionController.delete);

export const serviceExpeditionRoutes = router;
