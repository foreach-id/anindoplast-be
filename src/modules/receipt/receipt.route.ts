import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { UserRole } from '@prisma/client';
import { ReceiptController } from './receipt.controller';
import { validate } from '@root/src/middleware/validateRequest';
import { receiptSchemas } from './receipt.schema';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.post('/receipt', validate(receiptSchemas.generateReceipt), ReceiptController.generateReceipt);

export const receiptRoutes = router;
