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
  CancelByAwbResponse,
  PickupScheduleResponse,
  ShipperConfig,
  ProvinceResponse,
  CityResponse,
  KelurahanResponse,
  AddressSearchResponse,
  ShippingPriceDTO,
  ShippingPriceResponse,
  CourierListResponse,
  CourierGroupResponse,
  CourierDetailResponse,
  SetCourierPreferenceResponse,
  TrackingOrderExpressResponse,
} from './kiriminaja.types';

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

  static async trackOrder(awb: string): Promise<TrackingResponse> {
    const response = await kiriminAjaClient.get<TrackingResponse>('/api/mitra/v2/shTracking', { awb });
    return response;
  }

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

  static async getProvinces(): Promise<ProvinceResponse> {
    return kiriminAjaClient.post<ProvinceResponse>('/api/mitra/province');
  }

  static async getCities(provinceId: number): Promise<CityResponse> {
    return kiriminAjaClient.post<CityResponse>('/api/mitra/city', { provinsi_id: provinceId });
  }

  static async getDistrict(cityId: number): Promise<CityResponse> {
    return kiriminAjaClient.post<CityResponse>('/api/mitra/kecamatan', { kabupaten_id: cityId });
  }

  static async getSubdistrict(districtId: number): Promise<KelurahanResponse> {
    return kiriminAjaClient.post<KelurahanResponse>('/api/mitra/kelurahan', { kecamatan_id: districtId });
  }

  static async searchAddress(search: string): Promise<AddressSearchResponse> {
    return kiriminAjaClient.post<AddressSearchResponse>('/api/mitra/v2/get_address_by_name', { search });
  }
  // ------------------------------------------------------------------
  // 11. SHIPPING PRICE v6.1
  // POST /api/mitra/v6.1/shipping_price
  // ------------------------------------------------------------------
  static async getShippingPrice(dto: ShippingPriceDTO): Promise<ShippingPriceResponse> {
    return kiriminAjaClient.post<ShippingPriceResponse>('/api/mitra/v6.1/shipping_price', {
      origin: dto.origin,
      destination: dto.destination,
      weight: dto.weight,
      item_value: String(dto.itemValue),
      insurance: dto.insurance ?? 0,
      ...(dto.courier && dto.courier.length > 0 && { courier: dto.courier }),
    });
  }

  // ------------------------------------------------------------------
  // 12. CANCEL ORDER EXPRESS BY AWB
  // POST /api/mitra/v3/cancel_shipment
  // Berbeda dengan cancelShipment (by order ID internal),
  // endpoint ini pakai AWB langsung sesuai docs KiriminAja.
  // ------------------------------------------------------------------
  static async cancelByAwb(awb: string, reason: string): Promise<CancelByAwbResponse> {
    const response = await kiriminAjaClient.post<CancelByAwbResponse>('/api/mitra/v3/cancel_shipment', {
      awb,
      reason,
    });

    if (!response.status) {
      throw new Error(`KiriminAja gagal membatalkan paket: ${response.text}`);
    }

    // Update status order di DB berdasarkan AWB (deliveryNumber)
    await prisma.order.updateMany({
      where: { deliveryNumber: awb, deletedAt: null },
      data: { status: 'CANCELLED' },
    });

    return response;
  }

  // ------------------------------------------------------------------
  // 13. PICKUP SCHEDULE
  // POST /api/mitra/v2/schedules
  // Ambil jadwal pickup yang tersedia dari KiriminAja
  // ------------------------------------------------------------------
  static async getPickupSchedule(): Promise<PickupScheduleResponse> {
    return kiriminAjaClient.post<PickupScheduleResponse>('/api/mitra/v2/schedules');
  }

  // ------------------------------------------------------------------
  // 14. COURIER LIST
  // POST /api/mitra/couriers
  // ------------------------------------------------------------------
  static async getCouriers(): Promise<CourierListResponse> {
    return kiriminAjaClient.post<CourierListResponse>('/api/mitra/couriers');
  }

  // ------------------------------------------------------------------
  // 15. COURIER GROUP
  // POST /api/mitra/couriers_group
  // ------------------------------------------------------------------
  static async getCourierGroups(): Promise<CourierGroupResponse> {
    return kiriminAjaClient.post<CourierGroupResponse>('/api/mitra/couriers_group');
  }

  // ------------------------------------------------------------------
  // 16. COURIER DETAIL (layanan per kurir)
  // POST /api/mitra/courier_services
  // Body: { courier_code }
  // ------------------------------------------------------------------
  static async getCourierDetail(courierCode: string): Promise<CourierDetailResponse> {
    return kiriminAjaClient.post<CourierDetailResponse>('/api/mitra/courier_services', {
      courier_code: courierCode,
    });
  }

  // ------------------------------------------------------------------
  // 17. SET COURIER PREFERENCE (whitelist ekspedisi)
  // POST /api/mitra/v3/set_whitelist_services
  // Body: { services: string[] } — null/kosong untuk reset
  // ------------------------------------------------------------------
  static async setCourierPreference(services: string[] | null): Promise<SetCourierPreferenceResponse> {
    return kiriminAjaClient.post<SetCourierPreferenceResponse>('/api/mitra/v3/set_whitelist_services', {
      services,
    });
  }

  // ------------------------------------------------------------------
  // 18. TRACKING ORDER EXPRESS
  // POST /api/mitra/tracking
  // order_id bisa berupa Order ID atau AWB
  // ------------------------------------------------------------------
  static async trackOrderExpress(orderId: string): Promise<TrackingOrderExpressResponse> {
    return kiriminAjaClient.post<TrackingOrderExpressResponse>('/api/mitra/tracking', {
      order_id: orderId,
    });
  }
}
