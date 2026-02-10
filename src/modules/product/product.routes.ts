import { Router } from 'express';
import { ProductController } from './product.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { productSchemas } from './product.schema';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get('/all', ProductController.getAll);

router.get('/paginated', validate(productSchemas.queryParams), ProductController.getPaginated);

router.get('/detail/:id', validate(productSchemas.idParam), ProductController.getById);

router.post('/create', validate(productSchemas.create), ProductController.create);

router.patch('/update/:id', validate(productSchemas.update), ProductController.update);

router.delete('/delete/:id', validate(productSchemas.idParam), ProductController.delete);

export const productRoutes = router;