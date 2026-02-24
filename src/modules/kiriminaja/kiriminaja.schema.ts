import { z } from 'zod';

export const kiriminAjaSchemas = {

  // POST /api/shipping/check-rate
  checkRate: z.object({
    body: z.object({
      originDistrictId: z.number().int().positive('Origin district ID wajib diisi'),
      destinationDistrictId: z.number().int().positive('Destination district ID wajib diisi'),
      weightGram: z.number().int().positive('Berat harus lebih dari 0 gram'),
      itemValue: z.number().nonnegative().optional(),
      cod: z.boolean().optional().default(false),
    }),
  }),

  // POST /api/shipping/create
  createShipment: z.object({
    body: z.object({
      orderId: z.number().int().positive('Order ID wajib diisi'),
      service: z.string().min(1, 'Kode service wajib diisi (cth: jnt, jne, sicepat)'),
      serviceType: z.string().min(1, 'Tipe service wajib diisi (cth: REG, YES)'),
      receiverKecamatanId: z.number().int().positive('Kecamatan ID penerima wajib diisi'),
      receiverKelurahanId: z.number().int().positive('Kelurahan ID penerima wajib diisi'),
      receiverZipcode: z.number().int().positive('Kode pos penerima wajib diisi'),
      shippingCost: z.number().nonnegative('Ongkir tidak boleh negatif'),
      cod: z.boolean().default(false),
      schedule: z.string().optional(),  // format: "YYYY-MM-DD HH:mm:ss"
    }),
  }),

  // GET /api/shipping/track/awb/:awb
  trackByAwb: z.object({
    params: z.object({
      awb: z.string().min(1, 'AWB wajib diisi'),
    }),
  }),

  // GET /api/shipping/track/order/:id
  trackByOrderId: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  // POST /api/shipping/cancel/:id
  cancelShipment: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      reason: z.string().optional(),
    }),
  }),

  // GET /api/shipping/district/search?keyword=xxx
  searchDistrict: z.object({
    query: z.object({
      keyword: z.string().min(2, 'Keyword minimal 2 karakter'),
    }),
  }),
};