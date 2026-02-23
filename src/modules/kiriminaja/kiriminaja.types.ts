// ============================================================
// CHECK PRICING - GET /api/mitra/v2/check-price
// ============================================================

export interface CheckPricingRequest {
  origin_district_id: number;
  destination_district_id: number;
  weight: number;     // gram
  item_value?: number;
  cod?: boolean;
}

export interface CourierRate {
  service: string;           // "jnt", "jne", "sicepat", dst
  service_type: string;      // "REG", "YES", "BEST", dst
  service_label: string;     // "J&T Regular", "JNE Reguler"
  price: number;             // ongkir dalam rupiah
  estimated_day: string;     // "2-3 hari"
  cod: boolean;
  insurance: boolean;
  insurance_fee: number;
  cod_fee: number;
  weight: number;
  min_weight: number;
  group: string;
}

export interface CheckPricingResponse {
  status: boolean;
  text: string;
  method: string;
  data: CourierRate[];
}

// ============================================================
// CREATE ORDER EXPRESS - POST /api/mitra/v5/request_pickup
// Dokumentasi: https://developer.kiriminaja.com/docs/express/request
// ============================================================

export interface KiriminAjaPackage {
  order_id: string;                    // order_number internal kamu
  destination_name: string;            // nama penerima
  destination_phone: string;           // nomor hp penerima
  destination_address: string;         // alamat lengkap penerima
  destination_kecamatan_id: number;    // ID kecamatan KiriminAja
  destination_kelurahan_id: number;    // ID kelurahan KiriminAja
  destination_zipcode: number;         // kode pos
  weight: number;                      // gram
  width?: number;                      // cm
  height?: number;                     // cm
  length?: number;                     // cm
  item_value: number;                  // nilai barang (rupiah)
  shipping_cost: number;               // ongkir yang dipilih user dari check-price
  service: string;                     // "jnt", "jne", "sicepat"
  service_type: string;                // "REG", "YES"
  item_name: string;                   // nama/deskripsi isi paket
  package_type_id?: number;            // 7 = parcel (default)
  cod?: number;                        // nominal COD dalam rupiah (isi jika COD)
}

export interface CreateOrderExpressRequest {
  // Data pengirim (dari .env)
  name: string;              // nama toko / pengirim
  phone: string;             // no hp pengirim
  address: string;           // alamat pengirim
  kecamatan_id: number;      // ID kecamatan pengirim (KiriminAja)
  kelurahan_id: number;      // ID kelurahan pengirim (KiriminAja)
  zipcode: string;           // kode pos pengirim
  schedule: string;          // "2026-02-21 10:00:00" - waktu pickup

  packages: KiriminAjaPackage[];
}

// Response dari KiriminAja setelah buat order
export interface KiriminAjaOrderDetail {
  order_id: string;          // order_number kamu
  kj_order_id: string;       // order_id internal KiriminAja
  awb: string | null;        // nomor resi (bisa null saat baru dibuat)
  service: string;
  service_type: string;
}

export interface CreateOrderExpressResponse {
  status: boolean;
  text: string;
  method: string;             // "request_pickup"
  payment_status: string;     // "paid" | "unpaid"
  qr_url?: string;            // QR payment jika unpaid
  details: KiriminAjaOrderDetail[];
  pickup_number: string;      // "XID-7850941654"
}

// ============================================================
// TRACKING - GET /api/mitra/v2/shTracking?awb={awb}
// Dokumentasi: https://developer.kiriminaja.com/docs/express/tracking
// ============================================================

export interface TrackingImages {
  camera_img: string | null;
  signature_img: string | null;
  pop_img: string | null;
}

export interface TrackingCosts {
  add_cost: number;
  currency: string;
  cod: number;
  insurance_amount: number;
  insurance_percent: number;
  discount_amount: number;
  subsidi_amount: number;
  shipping_cost: number;
  correction: number;
}

export interface TrackingAddress {
  name: string;
  address: string;
  phone: string;
  city: string;
  zip_code: string;
}

export interface TrackingHistory {
  created_at: string;
  status: string;
  status_code: number;
  driver: string;
  receiver: string;
}

export interface TrackingDetails {
  awb: string;
  signature_code: string;
  sorting_code: string;
  order_id: string;
  status_code: number | null;
  estimation: string;
  service: string;
  service_name: string;
  drop: boolean;
  shipped_at: string;
  delivered: boolean;
  delivered_at: string;
  refunded: boolean;
  refunded_at: string;
  images: TrackingImages;
  costs: TrackingCosts;
  origin: TrackingAddress;
  destination: TrackingAddress;
}

export interface TrackingResponse {
  status: boolean;
  text: string;
  method: string;
  status_code: number;
  details: TrackingDetails;
  histories: TrackingHistory[];
}

// ============================================================
// CANCEL ORDER - POST /api/mitra/v2/order/void
// ============================================================

export interface CancelOrderRequest {
  order_id: string;    // order_number internal kamu
  reason?: string;
}

export interface CancelOrderResponse {
  status: boolean;
  text: string;
  method: string;
  details: {
    order_id: string;
    status: string;
  };
}

// ============================================================
// COVERAGE AREA SEARCH
// GET /api/mitra/v2/district/search?keyword=xxx
// ============================================================

export interface DistrictResult {
  id: number;
  name: string;
  city: string;
  province: string;
  zip_code: string;
}

export interface SearchDistrictResponse {
  status: boolean;
  text: string;
  method: string;
  data: DistrictResult[];
}

// ============================================================
// INTERNAL DTO - payload dari controller ke service
// ============================================================

export interface ShipperConfig {
  name: string;
  phone: string;
  kecamatan_id: number;
  kelurahan_id: number;
  address: string;
  zipcode: string;
}

export interface CreateShipmentDTO {
  orderId: number;
  service: string;                  // "jnt", "jne", "sicepat"
  serviceType: string;              // "REG", "YES"
  receiverKecamatanId: number;      // ID kecamatan KiriminAja
  receiverKelurahanId: number;      // ID kelurahan KiriminAja
  receiverZipcode: number;
  shippingCost: number;             // Ongkir yang sudah dicek dari check-price
  cod: boolean;
  schedule?: string;                // default: 2 jam dari sekarang
}

export interface CheckRateDTO {
  originDistrictId: number;
  destinationDistrictId: number;
  weightGram: number;
  itemValue?: number;
  cod?: boolean;
}