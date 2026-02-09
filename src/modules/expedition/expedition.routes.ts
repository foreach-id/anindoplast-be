import { Router } from 'express';
import { ExpeditionController } from './expedition.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { expeditionSchemas } from './expedition.schema';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all', ExpeditionController.getAllExpeditions);

router.get('/paginated', validate(expeditionSchemas.queryParams), ExpeditionController.getExpeditionPaginated);

router.get('/detail/:id', validate(expeditionSchemas.idParam), ExpeditionController.getExpeditionById);

router.post('/create', validate(expeditionSchemas.create), ExpeditionController.createExpedition);

router.patch('/update/:id', validate(expeditionSchemas.update), ExpeditionController.updateExpedition);

router.patch('/change_status/:id', validate(expeditionSchemas.idParam), ExpeditionController.changeExpeditionStatus);

router.delete('/delete/:id', validate(expeditionSchemas.idParam), ExpeditionController.deleteExpedition);

export const expeditionRoutes = router;
