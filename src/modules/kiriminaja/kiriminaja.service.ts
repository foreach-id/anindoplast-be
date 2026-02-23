import prisma from '../../config/prisma';
import { kiriminAjaClient } from './kiriminaja.client';
import {
  CheckRateDTO,
  CheckPricingResponse,
  CreateShipmentDTO,
  CreateOrderExpressRequest,
  CreateOrderExpressResponse,
  TrackingResponse,
  CancelOrderResponse,
  SearchDistrictResponse,
  ShipperConfig,
} from './kiriminaja.types';

/**
 * Ambil konfigurasi pengirim (toko) dari environment variables
 * Wajib diisi di .env sebelum bisa buat shipment
 */
function getShipperConfig(): ShipperConfig {
  const name         = process.env.SHIPPER_NAME;
  const phone        = process.env.SHIPPER_PHONE;
  const kecamatanId  = process.env.SHIPPER_KECAMATAN_ID;
  const kelurahanId  = process.env.SHIPPER_KELURAHAN_ID;
  const address      = process.env.SHIPPER_ADDRESS;
  const zipcode      = process.env.SHIPPER_ZIPCODE;

  if (!name || !phone || !kecamatanId || !kelurahanId || !address || !zipcode) {
    throw new Error(
      'Shipper config tidak lengkap. Pastikan SHIPPER_NAME, SHIPPER_PHONE, ' +
      'SHIPPER_KECAMATAN_ID, SHIPPER_KELURAHAN_ID, SHIPPER_ADDRESS, SHIPPER_ZIPCODE ' +
      'sudah diisi di .env',
    );
  }

  return {
    name,
    phone,
    kecamatan_id: Number(kecamatanId),
    kelurahan_id: Number(kelurahanId),
    address,
    zipcode,
  };
}

/**
 * Generate jadwal pickup = sekarang + 2 jam (format: "YYYY-MM-DD HH:mm:ss")
 */
function generateSchedule(customSchedule?: string): string {
  if (customSchedule) return customSchedule;
  const now = new Date();
  now.setHours(now.getHours() + 2);
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

export class KiriminAjaService {

  // ------------------------------------------------------------------
  // 1. CEK ONGKIR
  // GET /api/mitra/v2/check-price
  //
  // Real Request:
  // GET /api/mitra/v2/check-price
  //   ?origin_district_id=548
  //   &destination_district_id=31487
  //   &weight=520
  //   &item_value=275000
  //   &cod=1
  //
  // Real Response:
  // {
  //   "status": true,
  //   "text": "success",
  //   "method": "check-price",
  //   "data": [
  //     {
  //       "service": "jnt",
  //       "service_type": "REG",
  //       "service_label": "J&T Regular",
  //       "price": 15000,
  //       "estimated_day": "2-3 hari",
  //       "cod": true,
  //       "cod_fee": 3500,
  //       "insurance_fee": 0,
  //       "weight": 520,
  //       "min_weight": 1000,
  //       "group": "regular"
  //     },
  //     ...
  //   ]
  // }
  // ------------------------------------------------------------------
  static async checkRate(dto: CheckRateDTO): Promise<CheckPricingResponse> {
    const response = await kiriminAjaClient.get<CheckPricingResponse>(
      '/api/mitra/v2/check-price',
      {
        origin_district_id: dto.originDistrictId,
        destination_district_id: dto.destinationDistrictId,
        weight: dto.weightGram,
        item_value: dto.itemValue ?? 0,
        cod: dto.cod ? 1 : 0,
      },
    );
    return response;
  }

  // ------------------------------------------------------------------
  // 2. BUAT ORDER / REQUEST PICKUP
  // POST /api/mitra/v5/request_pickup
  //
  // Real Request Body:
  // {
  //   "name": "Ferawani Store",
  //   "phone": "0813334546789",
  //   "address": "Jl. Palagan No. 77 Mudal",
  //   "kecamatan_id": 548,
  //   "kelurahan_id": 31487,
  //   "zipcode": "55598",
  //   "schedule": "2026-02-21 10:00:00",
  //   "packages": [
  //     {
  //       "order_id": "AMP17403291234",
  //       "destination_name": "Budi Santoso",
  //       "destination_phone": "081234567890",
  //       "destination_address": "Jl. Sudirman No. 45, Jakarta Pusat",
  //       "destination_kecamatan_id": 548,
  //       "destination_kelurahan_id": 31483,
  //       "destination_zipcode": 55598,
  //       "weight": 520,
  //       "width": 8,
  //       "height": 8,
  //       "length": 8,
  //       "item_value": 275000,
  //       "shipping_cost": 15000,
  //       "service": "jnt",
  //       "service_type": "REG",
  //       "item_name": "Botol Plastik 500ml x2, Galon Air 19L x1",
  //       "package_type_id": 7,
  //       "cod": 290000
  //     }
  //   ]
  // }
  //
  // Real Response:
  // {
  //   "status": true,
  //   "text": "Request pickup berhasil",
  //   "method": "request_pickup",
  //   "payment_status": "paid",
  //   "details": [
  //     {
  //       "order_id": "AMP17403291234",
  //       "kj_order_id": "AMP17403291234",
  //       "awb": "JX1234567890",
  //       "service": "jnt",
  //       "service_type": "REG"
  //     }
  //   ],
  //   "pickup_number": "XID-7850941654"
  // }
  // ------------------------------------------------------------------
  static async createShipment(dto: CreateShipmentDTO): Promise<CreateOrderExpressResponse> {
    // 1. Ambil data order dari DB beserta semua relasi yang dibutuhkan
    const order = await prisma.order.findFirst({
      where: { id: dto.orderId, deletedAt: null },
      include: {
        customer: true,
        customerAddress: true,
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) throw new Error('Order tidak ditemukan');

    // 2. Cegah duplikasi – jika sudah punya AWB, tolak
    if (order.deliveryNumber) {
      throw new Error(
        `Order ini sudah memiliki nomor resi: ${order.deliveryNumber}. ` +
        `Tidak bisa membuat shipment duplikat.`,
      );
    }

    // 3. Hitung total berat dari semua order items
    const totalWeightGram = order.orderItems.reduce((sum, item) => {
      return sum + (item.product.weight ?? 0) * item.quantity;
    }, 0);

    if (totalWeightGram === 0) {
      throw new Error(
        'Total berat produk adalah 0 gram. ' +
        'Pastikan semua produk sudah memiliki nilai berat yang valid.',
      );
    }

    // 4. Ambil konfigurasi pengirim dari .env
    const shipper = getShipperConfig();

    // 5. Buat deskripsi isi paket dari order items
    const itemName = order.orderItems
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join(', ');

    // 6. Ambil dimensi dari produk pertama (jika ada)
    const firstProduct = order.orderItems[0]?.product;

    // 7. Susun payload package
    const packagePayload = {
      order_id: order.orderNumber,
      destination_name: order.customer.name,
      destination_phone: `${order.customer.countryCode}${order.customer.phone}`,
      destination_address: order.customerAddress.address,
      destination_kecamatan_id: dto.receiverKecamatanId,
      destination_kelurahan_id: dto.receiverKelurahanId,
      destination_zipcode: dto.receiverZipcode,
      weight: totalWeightGram,
      width: firstProduct?.width ? Math.ceil(firstProduct.width) : 10,
      height: firstProduct?.height ? Math.ceil(firstProduct.height) : 10,
      length: firstProduct?.length ? Math.ceil(firstProduct.length) : 10,
      item_value: Number(order.totalAmount),
      shipping_cost: dto.shippingCost,
      service: dto.service,
      service_type: dto.serviceType,
      item_name: itemName,
      package_type_id: 7, // 7 = parcel (default)
      // COD: isi nominal jika COD, kosongkan jika bukan COD
      ...(dto.cod && { cod: Number(order.grandTotal) }),
    };

    // 8. Susun full payload request
    const payload: CreateOrderExpressRequest = {
      name: shipper.name,
      phone: shipper.phone,
      address: shipper.address,
      kecamatan_id: shipper.kecamatan_id,
      kelurahan_id: shipper.kelurahan_id,
      zipcode: shipper.zipcode,
      schedule: generateSchedule(dto.schedule),
      packages: [packagePayload],
    };

    // 9. Hit KiriminAja API
    const response = await kiriminAjaClient.post<CreateOrderExpressResponse>(
      '/api/mitra/v5/request_pickup',
      payload as any,
    );

    if (!response.status) {
      throw new Error(`KiriminAja menolak request: ${response.text}`);
    }

    // 10. Ambil AWB dari response (bisa null saat baru dibuat, akan diupdate via webhook)
    const orderDetail = response.details[0];
    const awb = orderDetail?.awb ?? null;

    // 11. Update DB: simpan AWB & pickup_number, ubah status → CONFIRMED
    await prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryNumber: awb,
        status: 'CONFIRMED',
      },
    });

    return response;
  }

  // ------------------------------------------------------------------
  // 3. TRACKING BERDASARKAN AWB
  // GET /api/mitra/v2/shTracking?awb={awb}
  //
  // Real Response:
  // {
  //   "status": true,
  //   "text": "Delivered to BAGUS | 14-07-2021 16:00 | YOGYAKARTA",
  //   "method": "shTracking",
  //   "status_code": 200,
  //   "details": {
  //     "awb": "DEVEL-000000004",
  //     "order_id": "OID-8793949106",
  //     "service": "jne",
  //     "service_name": "REG",
  //     "shipped_at": "2021-07-13 17:44:04",
  //     "delivered": true,
  //     "delivered_at": "2021-10-17 16:53:00",
  //     "origin": { "name": "KiriminAja", "city": "Sleman", ... },
  //     "destination": { "name": "Zainal Arifin", "city": "Bantul", ... }
  //   },
  //   "histories": [
  //     { "created_at": "2021-07-14 16:00:00", "status": "Delivered to BAGUS...", "status_code": 200 },
  //     { "created_at": "2021-07-14 09:53:00", "status": "With delivery courier YOGYAKARTA", "status_code": 100 },
  //     ...
  //   ]
  // }
  // ------------------------------------------------------------------
  static async trackOrder(awb: string): Promise<TrackingResponse> {
    const response = await kiriminAjaClient.get<TrackingResponse>(
      '/api/mitra/v2/shTracking',
      { awb },
    );
    return response;
  }

  // ------------------------------------------------------------------
  // 4. TRACKING BERDASARKAN ORDER ID INTERNAL
  // (Helper: cari AWB dari DB dulu, lalu track)
  // ------------------------------------------------------------------
  static async trackByOrderId(orderId: number): Promise<TrackingResponse> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      select: { deliveryNumber: true, orderNumber: true, status: true },
    });

    if (!order) throw new Error('Order tidak ditemukan');
    if (!order.deliveryNumber) {
      throw new Error(
        `Order ${order.orderNumber} belum memiliki nomor resi. ` +
        `Pastikan sudah membuat shipment ke KiriminAja terlebih dahulu.`,
      );
    }

    return this.trackOrder(order.deliveryNumber);
  }

  // ------------------------------------------------------------------
  // 5. CANCEL ORDER
  // POST /api/mitra/v2/order/void
  //
  // Real Request Body:
  // { "order_id": "AMP17403291234", "reason": "Pembatalan oleh customer" }
  //
  // Real Response:
  // { "status": true, "text": "Order berhasil dibatalkan", "method": "void",
  //   "details": { "order_id": "AMP17403291234", "status": "cancelled" } }
  // ------------------------------------------------------------------
  static async cancelShipment(orderId: number, reason?: string): Promise<CancelOrderResponse> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      select: { orderNumber: true, deliveryNumber: true, status: true },
    });

    if (!order) throw new Error('Order tidak ditemukan');
    if (!order.deliveryNumber) {
      throw new Error('Order belum memiliki nomor resi, tidak perlu cancel ke KiriminAja');
    }
    if (order.status === 'CANCELLED') {
      throw new Error('Order ini sudah berstatus CANCELLED');
    }
    if (order.status === 'DELIVERED') {
      throw new Error('Order yang sudah DELIVERED tidak bisa dibatalkan');
    }

    const response = await kiriminAjaClient.post<CancelOrderResponse>(
      '/api/mitra/v2/order/void',
      {
        order_id: order.orderNumber,
        reason: reason ?? 'Pembatalan oleh sistem',
      },
    );

    if (!response.status) {
      throw new Error(`KiriminAja gagal membatalkan order: ${response.text}`);
    }

    // Update status order di DB
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return response;
  }

  // ------------------------------------------------------------------
  // 6. SEARCH DISTRICT / KECAMATAN
  // GET /api/mitra/v2/district/search?keyword=yogyakarta
  //
  // Real Response:
  // {
  //   "status": true,
  //   "data": [
  //     { "id": 548, "name": "Mlati", "city": "Sleman", "province": "DIY", "zip_code": "55283" },
  //     ...
  //   ]
  // }
  // ------------------------------------------------------------------
  static async searchDistrict(keyword: string): Promise<SearchDistrictResponse> {
    const response = await kiriminAjaClient.get<SearchDistrictResponse>(
      '/api/mitra/v2/district/search',
      { keyword },
    );
    return response;
  }
}