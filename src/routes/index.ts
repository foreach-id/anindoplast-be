import { Router } from 'express';
import {authRoutes} from '@modules/auth/auth.routes';
import {userRoutes} from '@modules/user/user.routes';
import { expeditionRoutes } from '../modules/expedition/user.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expedition', expeditionRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Order-MGMT API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

export default router;
