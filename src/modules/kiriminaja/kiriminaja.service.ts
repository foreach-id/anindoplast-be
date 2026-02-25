import prisma from '../../config/prisma';
import { kiriminAjaClient } from './kiriminaja.client';
import {
  CheckRateDTO,
  CheckPricingResponse,
  CreateShipmentDTO,
  CreateOrderExpressRequest,
  CreateOrderExpressResponse,
  KiriminAjaPackage,
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
  const name = process.env.SHIPPER_NAME;
  const phone = process.env.SHIPPER_PHONE;
  const kecamatanId = process.env.SHIPPER_KECAMATAN_ID;
  const kelurahanId = process.env.SHIPPER_KELURAHAN_ID;
  const address = process.env.SHIPPER_ADDRESS;
  const zipcode = process.env.SHIPPER_ZIPCODE;

  if (!name || !phone || !kecamatanId || !kelurahanId || !address || !zipcode) {
    throw new Error('Shipper config tidak lengkap. Pastikan SHIPPER_NAME, SHIPPER_PHONE, ' + 'SHIPPER_KECAMATAN_ID, SHIPPER_KELURAHAN_ID, SHIPPER_ADDRESS, SHIPPER_ZIPCODE ' + 'sudah diisi di .env');
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
 * Generate jadwal pickup = sekarang + 2 jam (format: "YYYY-MM-DD HH:mm:ss", timezone WIB)
 */
function generateSchedule(customSchedule?: string): string {
  if (customSchedule) return customSchedule;
  const now = new Date();
  now.setTime(now.getTime() + 2 * 60 * 60 * 1000); // +2 jam

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(now).replace('T', ' ');
}

export class KiriminAjaService {
  static async checkRate(dto: CheckRateDTO): Promise<CheckPricingResponse> {
    const response = await kiriminAjaClient.get<CheckPricingResponse>('/api/mitra/v2/check-price', {
      origin_district_id: dto.originDistrictId,
      destination_district_id: dto.destinationDistrictId,
      weight: dto.weightGram,
      item_value: dto.itemValue ?? 0,
      cod: dto.cod ? 1 : 0,
    });
    return response;
  }

  static async createShipmentExpress(dto: CreateShipmentDTO): Promise<CreateOrderExpressResponse> {
    // 1. Ambil data order beserta order items (product + category)
    const order = await prisma.order.findFirst({
      where: { id: dto.orderId, deletedAt: null },
      include: {
        orderItems: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!order) throw new Error('Order tidak ditemukan');

    // 2. Cegah duplikasi – jika sudah punya AWB, tolak
    if (order.deliveryNumber) {
      throw new Error(`Order ini sudah memiliki nomor resi: ${order.deliveryNumber}. ` + `Tidak bisa membuat shipment duplikat.`);
    }

    // 3. Validasi: service & serviceType harus sudah diisi di order
    if (!order.service || !order.serviceType) {
      throw new Error('Order belum memiliki data service ekspedisi. ' + 'Pastikan service dan serviceType sudah diisi pada order.');
    }

    // 4. Ambil data alamat penerima dari CustomerAddress (untuk kecamatan/kelurahan ID)
    if (!order.customerAddressId) {
      throw new Error('Order tidak memiliki alamat pengiriman.');
    }

    const customerAddress = await prisma.customerAddress.findUnique({
      where: { id: order.customerAddressId },
    });

    if (!customerAddress) {
      throw new Error('Alamat pengiriman tidak ditemukan.');
    }

    if (!customerAddress.districtId || !customerAddress.subDistrictId) {
      throw new Error('Alamat pengiriman belum memiliki data kecamatan/kelurahan KiriminAja. ' + 'Pastikan districtId dan subDistrictId sudah diisi.');
    }

    // 5. Hitung total berat dari semua order items (× qty)
    const totalWeightGram = order.orderItems.reduce((sum, item) => {
      return sum + (item.productWeight ?? 0) * item.quantity;
    }, 0);

    if (totalWeightGram === 0) {
      throw new Error('Total berat produk adalah 0 gram. ' + 'Pastikan semua produk sudah memiliki nilai berat yang valid.');
    }

    // 6. Hitung dimensi: ambil nilai terbesar dari semua produk (standar packaging)
    const maxWidth = Math.max(...order.orderItems.map((i) => i.productWidth ?? 0));
    const maxHeight = Math.max(...order.orderItems.map((i) => i.productHeight ?? 0));
    const maxLength = Math.max(...order.orderItems.map((i) => i.productLength ?? 0));

    // 7. Hitung total nilai barang dari subtotal semua order items
    const totalItemValue = order.orderItems.reduce((sum, item) => {
      return sum + Number(item.subtotal);
    }, 0);

    // 8. Ambil package_type_id dari kategori produk pertama (default: 7)
    const firstProductCategory = order.orderItems[0]?.product?.category;
    const packageTypeId = (firstProductCategory as any)?.packageTypeId ?? 7;

    // 9. Susun item_name: "3 Produk A, 1 Produk B"
    const itemName = order.orderItems.map((item) => `${item.quantity} ${item.productName}`).join(', ');

    // 10. Ambil konfigurasi pengirim dari .env
    const shipper = getShipperConfig();

    // 11. Susun payload package
    const packagePayload: KiriminAjaPackage = {
      order_id: order.orderNumber,
      destination_name: order.customerName ?? '',
      destination_phone: `${order.customerCountryCode ?? ''}${order.customerPhone ?? ''}`,
      destination_address: order.customerAddressFull ?? '',
      destination_kecamatan_id: customerAddress.districtId,
      destination_kelurahan_id: customerAddress.subDistrictId,
      destination_zipcode: Number(customerAddress.zipCode ?? 0),
      weight: totalWeightGram,
      width: maxWidth > 0 ? Math.ceil(maxWidth) : 10,
      height: maxHeight > 0 ? Math.ceil(maxHeight) : 10,
      length: maxLength > 0 ? Math.ceil(maxLength) : 10,
      item_value: totalItemValue,
      shipping_cost: Number(order.shippingCost),
      service: order.service,
      service_type: order.serviceType,
      item_name: itemName,
      package_type_id: packageTypeId,
      cod: order.isCod ? 1 : 0,
      drop: order.isDropOff,
      note: order.notes ?? undefined,
    };

    // 12. Susun full payload request
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

    // 13. Hit KiriminAja API
    const response = await kiriminAjaClient.post<CreateOrderExpressResponse>('/api/mitra/v5/request_pickup', payload as any);

    if (!response.status) {
      throw new Error(`KiriminAja menolak request: ${response.text}`);
    }

    // 14. Ambil AWB dari response
    const orderDetail = response.details[0];
    const awb = orderDetail?.awb ?? null;

    // 15. Update DB: simpan AWB & ubah status → CONFIRMED
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
    const response = await kiriminAjaClient.get<TrackingResponse>('/api/mitra/v2/shTracking', { awb });
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
      throw new Error(`Order ${order.orderNumber} belum memiliki nomor resi. ` + `Pastikan sudah membuat shipment ke KiriminAja terlebih dahulu.`);
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

    const response = await kiriminAjaClient.post<CancelOrderResponse>('/api/mitra/v2/order/void', {
      order_id: order.orderNumber,
      reason: reason ?? 'Pembatalan oleh sistem',
    });

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
    const response = await kiriminAjaClient.get<SearchDistrictResponse>('/api/mitra/v2/district/search', { keyword });
    return response;
  }
}
