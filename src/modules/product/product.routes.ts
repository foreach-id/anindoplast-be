import { Router } from 'express';
import * as productController from './product.controller';
import { validate as validateRequest } from '@middleware/validateRequest'; 
import AuthMiddleware from '@middleware/authMiddleware'; 
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema,
  productIdSchema  
} from './product.schema';

const router = Router();

router.use(AuthMiddleware.authenticate);

router.post(
  '/', 
  validateRequest(createProductSchema), 
  productController.create
);

router.get(
  '/', 
  validateRequest(productQuerySchema), 
  productController.findAll
);

router.get(
  '/:id', 
  validateRequest(productIdSchema),  
  productController.findOne
);

router.put(
  '/:id', 
  validateRequest(updateProductSchema), 
  productController.update
);

router.delete(
  '/:id', 
  validateRequest(productIdSchema),  
  productController.remove
);

export const productRoutes = router;