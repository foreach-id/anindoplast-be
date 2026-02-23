import { Router } from 'express';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { kiriminAjaSchemas } from './kiriminaja.schema';
import { KiriminAjaController } from './kiriminaja.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// Semua endpoint butuh login
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

/**
 * POST /api/shipping/check-rate
 * Cek ongkir dari origin ke destination sebelum buat shipment
 * Body: { originDistrictId, destinationDistrictId, weightGram, itemValue?, cod? }
 */
router.post(
  '/check-rate',
  validate(kiriminAjaSchemas.checkRate),
  KiriminAjaController.checkRate,
);

/**
 * POST /api/shipping/create
 * Buat shipment ke KiriminAja → AWB tersimpan ke orders.delivery_number
 * Body: { orderId, service, serviceType, receiverKecamatanId, receiverKelurahanId,
 *         receiverZipcode, shippingCost, cod, schedule? }
 */
router.post(
  '/create',
  validate(kiriminAjaSchemas.createShipment),
  KiriminAjaController.createShipment,
);

/**
 * GET /api/shipping/track/awb/:awb
 * Tracking paket berdasarkan nomor resi / AWB
 */
router.get(
  '/track/awb/:awb',
  validate(kiriminAjaSchemas.trackByAwb),
  KiriminAjaController.trackByAwb,
);

/**
 * GET /api/shipping/track/order/:id
 * Tracking paket berdasarkan order ID internal (ambil AWB dari DB)
 */
router.get(
  '/track/order/:id',
  validate(kiriminAjaSchemas.trackByOrderId),
  KiriminAjaController.trackByOrderId,
);

/**
 * POST /api/shipping/cancel/:id
 * Batalkan shipment ke KiriminAja berdasarkan order ID internal
 * Body: { reason? }
 */
router.post(
  '/cancel/:id',
  validate(kiriminAjaSchemas.cancelShipment),
  KiriminAjaController.cancelShipment,
);

/**
 * GET /api/shipping/district/search?keyword=xxx
 * Cari kecamatan / kelurahan KiriminAja untuk dropdown pilih area
 */
router.get(
  '/district/search',
  validate(kiriminAjaSchemas.searchDistrict),
  KiriminAjaController.searchDistrict,
);

export const kiriminAjaRoutes = router;