import { Router } from 'express';
import { authRoutes } from '@modules/auth/auth.routes';
import { userRoutes } from '@modules/user/user.routes';
import { productRoutes } from '@modules/product/product.routes';
// import { expeditionRoutes } from '../modules/expedition/expedition.routes';
// import { serviceExpeditionRoutes } from '../modules/serviceExpedition/serviceExpedition.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/product', productRoutes);
// router.use('/expedition', expeditionRoutes);
// router.use('/service-expedition', serviceExpeditionRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Order-MGMT API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      product: '/api/product',
      // expedition: '/api/expedition',
      // serviceExpedition: '/api/service-expedition',
    },
  });
});

export default router;
