// ============================================================
// CHECK PRICING - GET /api/mitra/v2/check-price
// ============================================================

export interface CheckPricingRequest {
  origin_district_id: number;
  destination_district_id: number;
  weight: number; // gram
  item_value?: number;
  cod?: boolean;
}

export interface CourierRate {
  service: string; // "jnt", "jne", "sicepat", dst
  service_type: string; // "REG", "YES", "BEST", dst
  service_label: string; // "J&T Regular", "JNE Reguler"
  price: number; // ongkir dalam rupiah
  estimated_day: string; // "2-3 hari"
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
// SHIPPING PRICE v6.1 - POST /api/mitra/v6.1/shipping_price
// ============================================================

export interface ShippingPriceDTO {
  origin: number; // kecamatan_id asal
  destination: number; // kecamatan_id tujuan
  weight: number; // gram
  itemValue: number; // nilai barang
  insurance?: number; // 0 = no, 1 = yes
  courier?: string[]; // filter kurir, misal ["jnt", "jne"]
}

export interface ShippingPriceDiscountCampaign {
  discount: number;
  discount_percentage: number;
  discount_campaign_id: number;
  discount_type: string;
}

export interface ShippingPriceSetting {
  cod_fee: string;
  minimum_cod_fee: string;
  insurance_fee: string;
  insurance_add_cost: number;
  cod_fee_amount: number;
}

export interface ShippingPriceResult {
  service: string;
  service_name: string;
  service_type: string;
  cost: string;
  etd: string;
  cod: boolean;
  group: string;
  drop: boolean;
  cut_off_time: string;
  force_insurance: boolean;
  add_cost: string;
  use_geolocation: boolean;
  use_insurance: boolean;
  is_mock_data: boolean;
  discount_campaign: ShippingPriceDiscountCampaign;
  discount_amount: number;
  discount_percentage: number;
  discount_type: string;
  setting: ShippingPriceSetting;
  insurance: number;
}

export interface ShippingPriceDetails {
  origin_district_id: number;
  destination_district_id: number;
  weight: number;
  item_value: string;
  insurance: number;
  courier: string[];
}

export interface ShippingPriceResponse {
  status: boolean;
  text: string;
  method: string;
  details: ShippingPriceDetails;
  results: ShippingPriceResult[];
}

// ============================================================
// CREATE ORDER EXPRESS - POST /api/mitra/v5/request_pickup
// Dokumentasi: https://developer.kiriminaja.com/docs/express/request
// ============================================================

export interface KiriminAjaPackage {
  order_id: string; // order_number internal kamu
  destination_name: string; // nama penerima
  destination_phone: string; // nomor hp penerima
  destination_address: string; // alamat lengkap penerima
  destination_kecamatan_id: number; // ID kecamatan KiriminAja
  destination_kelurahan_id: number; // ID kelurahan KiriminAja
  destination_zipcode: number; // kode pos
  weight: number; // gram
  width?: number; // cm
  height?: number; // cm
  length?: number; // cm
  item_value: number; // nilai barang (rupiah)
  shipping_cost: number; // ongkir yang dipilih user dari check-price
  service: string; // "jnt", "jne", "sicepat"
  service_type: string; // "REG", "YES"
  item_name: string; // nama/deskripsi isi paket
  package_type_id?: number; // 7 = parcel (default)
  cod?: number; // nominal COD dalam rupiah (isi jika COD)
  drop?: boolean; // apakah drop off (isi jika drop off)
  note?: string; // catatan untuk kurir
}

export interface CreateOrderExpressRequest {
  // Data pengirim (dari .env)
  name: string; // nama toko / pengirim
  phone: string; // no hp pengirim
  address: string; // alamat pengirim
  kecamatan_id: number; // ID kecamatan pengirim (KiriminAja)
  kelurahan_id: number; // ID kelurahan pengirim (KiriminAja)
  zipcode: string; // kode pos pengirim
  schedule: string; // "2026-02-21 10:00:00" - waktu pickup

  packages: KiriminAjaPackage[];
}

// Response dari KiriminAja setelah buat order
export interface KiriminAjaOrderDetail {
  order_id: string; // order_number kamu
  kj_order_id: string; // order_id internal KiriminAja
  awb: string | null; // nomor resi (bisa null saat baru dibuat)
  service: string;
  service_type: string;
}

export interface CreateOrderExpressResponse {
  status: boolean;
  text: string;
  method: string; // "request_pickup"
  payment_status: string; // "paid" | "unpaid"
  qr_url?: string; // QR payment jika unpaid
  details: KiriminAjaOrderDetail[];
  pickup_number: string; // "XID-7850941654"
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
  order_id: string; // order_number internal kamu
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
// CANCEL ORDER EXPRESS BY AWB - POST /api/mitra/v3/cancel_shipment
// Docs: https://developer.kiriminaja.com/docs/express/cancel
// ============================================================

export interface CancelByAwbRequest {
  awb: string;    // AWB Number (bukan order_id internal)
  reason: string; // min:5, max:200
}

export interface CancelByAwbResponse {
  status: boolean;
  text: string;
  method: string;
}

// ============================================================
// PICKUP SCHEDULE - POST /api/mitra/v2/schedules
// Docs: https://developer.kiriminaja.com/docs/pickup
// ============================================================

export interface PickupScheduleSlot {
  clock: string;     // "2021-02-15 14:00:00"
  until: string;     // "16:00"
  expired: number;   // unix timestamp
  libur: boolean;
}

export interface PickupScheduleResponse {
  status: boolean;
  method: string;
  text: string;
  schedules: PickupScheduleSlot[];
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

// ============================================================
// LOCATION DATA
// ============================================================

export interface Province {
  id: number;
  provinsi_name: string;
}

export interface ProvinceResponse {
  status: boolean;
  method: string;
  text: string;
  datas: Province[];
}

export interface City {
  id: number;
  provinsi_id: number;
  kabupaten_name: string;
  type: string;
  postal_code: string;
}

export interface CityResponse {
  status: boolean;
  method: string;
  text: string;
  datas: City[];
}

export interface Kelurahan {
  id: number;
  kelurahan_name: string;
  kecamatan_id: number;
}

export interface KelurahanResponse {
  status: boolean;
  text: string;
  method: string;
  results: Kelurahan[];
}

export interface AddressSearchResult {
  id: number;
  text: string;
}

export interface AddressSearchResponse {
  status: boolean;
  text: string;
  method: string;
  data: AddressSearchResult[];
}

export interface CreateShipmentDTO {
  orderId: number;
  schedule?: string; // default: 2 jam dari sekarang
}

export interface CheckRateDTO {
  originDistrictId: number;
  destinationDistrictId: number;
  weightGram: number;
  itemValue?: number;
  cod?: boolean;
}

// ============================================================
// COURIER LIST
// POST /api/mitra/couriers
// ============================================================

export interface CourierItem {
  code: string;
  name: string;
  type: string;
}

export interface CourierListResponse {
  status: boolean;
  method: string;
  text: string;
  datas: CourierItem[];
}

// ============================================================
// COURIER GROUP
// POST /api/mitra/couriers_group
// ============================================================

export interface CourierGroupItem {
  code: string;
  name: string;
}

export interface CourierGroupResponse {
  status: boolean;
  method: string;
  text: string;
  datas: CourierGroupItem[];
}

// ============================================================
// COURIER DETAIL (services per courier)
// POST /api/mitra/courier_services
// ============================================================

export interface CourierServiceItem {
  name: string;
  code: string;
}

export interface CourierDetailResponse {
  status: boolean;
  method: string;
  text: string;
  datas: CourierServiceItem[];
}

// ============================================================
// SET COURIER PREFERENCE (whitelist)
// POST /api/mitra/v3/set_whitelist_services
// ============================================================

export interface SetCourierPreferenceResponse {
  status: boolean;
  method: string;
  text: string;
  data: Record<string, unknown>;
}

// ============================================================
// TRACKING ORDER EXPRESS
// POST /api/mitra/tracking
// order_id bisa berupa Order ID atau AWB
// ============================================================

export interface TrackingHistory {
  status: string;
  date: string;
  description: string;
  city?: string;
}

export interface TrackingCostDetail {
  name: string;
  value: number;
}

export interface TrackingOriginDetail {
  name: string;
  value: string;
}

export interface TrackingOrderExpressResponse {
  status: boolean;
  text: string;
  method: string;
  status_code: number;
  details: {
    costs: TrackingCostDetail[];
    origin?: TrackingOriginDetail[];
  };
  histories: TrackingHistory[];
}

