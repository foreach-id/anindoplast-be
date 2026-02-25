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
router.post('/check-rate', validate(kiriminAjaSchemas.checkRate), KiriminAjaController.checkRate);

/**
 * POST /api/shipping/process/:id
 * Proses order ke KiriminAja — FE hanya perlu kirim order ID
 * Semua data (customer, alamat, service, items) diambil otomatis dari order
 */
router.post('/process/:id', validate(kiriminAjaSchemas.processOrder), KiriminAjaController.processOrder);

/**
 * GET /api/shipping/track/awb/:awb
 * Tracking paket berdasarkan nomor resi / AWB
 */
router.get('/track/awb/:awb', validate(kiriminAjaSchemas.trackByAwb), KiriminAjaController.trackByAwb);

/**
 * GET /api/shipping/track/order/:id
 * Tracking paket berdasarkan order ID internal (ambil AWB dari DB)
 */
router.get('/track/order/:id', validate(kiriminAjaSchemas.trackByOrderId), KiriminAjaController.trackByOrderId);

/**
 * POST /api/shipping/cancel/:id
 * Batalkan shipment ke KiriminAja berdasarkan order ID internal
 * Body: { reason? }
 */
router.post('/cancel/:id', validate(kiriminAjaSchemas.cancelShipment), KiriminAjaController.cancelShipment);

/**
 * GET /api/shipping/location/provinces
 */
router.get('/location/provinces', validate(kiriminAjaSchemas.getProvinces), KiriminAjaController.getProvinces);

/**
 * GET /api/shipping/location/cities?provinceId=xxx
 */
router.get('/location/cities', validate(kiriminAjaSchemas.getCities), KiriminAjaController.getCities);

/**
 * GET /api/shipping/location/districts?cityId=xxx
 */
router.get('/location/districts', validate(kiriminAjaSchemas.getDistricts), KiriminAjaController.getDistricts);

/**
 * GET /api/shipping/location/subdistricts?districtId=xxx
 */
router.get('/location/subdistricts', validate(kiriminAjaSchemas.getSubdistrict), KiriminAjaController.getSubdistrict);

/**
 * GET /api/shipping/location/address?search=xxx
 */
router.get('/location/address', validate(kiriminAjaSchemas.searchAddress), KiriminAjaController.searchAddress);

/**
 * POST /api/shipping/shipping-price
 * Cek ongkir menggunakan API v6.1
 */
router.post('/shipping_price', validate(kiriminAjaSchemas.getShippingPrice), KiriminAjaController.getShippingPrice);

export const kiriminAjaRoutes = router;
