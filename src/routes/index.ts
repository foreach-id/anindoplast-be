import { Router } from 'express';
import { authRoutes } from '@modules/auth/auth.routes';
import { userRoutes } from '@modules/user/user.routes';
import { expeditionRoutes } from '../modules/expedition/expedition.routes';
import { serviceExpeditionRoutes } from '../modules/serviceExpedition/serviceExpedition.routes';
import { paymentMethodRoutes } from '../modules/paymentMethod';
import { customerRoutes } from '../modules/customer/customer.routes';
import { customerAddressRoutes } from '../modules/customerAddress/customerAddress.routes';
import { orderRoutes } from '../modules/order/order.routes';
import { receiptRoutes } from '../modules/receipt/receipt.route';
import { productRoutes } from '../modules/product/product.routes';
import { statsRoutes } from '../modules/stats';
import { kiriminAjaRoutes } from '../modules/kiriminaja';
import { productCategoryRoutes } from '@modules/productCategory';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expedition', expeditionRoutes);
router.use('/service_expedition', serviceExpeditionRoutes);
router.use('/payment_method', paymentMethodRoutes);
router.use('/customer', customerRoutes);
router.use('/customer_address', customerAddressRoutes);
router.use('/product_category', productCategoryRoutes);
router.use('/product', productRoutes);
router.use('/order', orderRoutes);
router.use('/generate', receiptRoutes);
router.use('/stats', statsRoutes)
router.use('/shipping', kiriminAjaRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'ANINDO-PLAST API v1.7',
    version: '1.7.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      productCategory: '/api/product_category',
      product: '/api/product',
      expedition: '/api/expedition',
      serviceExpedition: '/api/service_expedition',
      paymentMethod: '/api/payment_method',
      customer: '/api/customer',
      customerAddress: '/api/customer_address',
      orderRoutes: '/api/order',
      shipping: '/api/shipping',
    },
  });
});

export default router;
