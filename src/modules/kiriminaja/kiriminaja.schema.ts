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

  // POST /api/shipping/process/:id
  processOrder: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z
      .object({
        schedule: z.string().optional(),
      })
      .optional(),
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

  // GET /api/shipping/location/provinces
  getProvinces: z.object({}),

  // GET /api/shipping/location/cities?provinceId=xxx
  getCities: z.object({
    query: z.object({
      provinceId: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  getDistricts: z.object({
    query: z.object({
      cityId: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  // GET /api/shipping/location/subdistricts?districtId=xxx
  getSubdistrict: z.object({
    query: z.object({
      districtId: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  // GET /api/shipping/location/address?search=xxx
  searchAddress: z.object({
    query: z.object({
      search: z.string().min(3, 'Search minimal 3 karakter'),
    }),
  }),

  // POST /api/shipping/shipping-price
  getShippingPrice: z.object({
    body: z.object({
      destination: z.number().int().positive('Destination kecamatan ID wajib diisi'),
      weight: z.number().int().positive('Berat harus lebih dari 0 gram'),
      itemValue: z.number().nonnegative('Nilai barang tidak boleh negatif'),
      insurance: z.number().int().min(0).max(1).optional().default(0),
      courier: z.array(z.string()).optional(),
    }),
  }),

  // POST /api/shipping/cancel/awb
  cancelByAwb: z.object({
    body: z.object({
      awb: z.string().min(1, 'AWB wajib diisi').max(30, 'AWB maksimal 30 karakter'),
      reason: z.string().min(5, 'Alasan minimal 5 karakter').max(200, 'Alasan maksimal 200 karakter'),
    }),
  }),

  // GET /api/shipping/pickup-schedule
  getPickupSchedule: z.object({}),

  // GET /api/shipping/couriers
  getCouriers: z.object({}),

  // GET /api/shipping/courier-groups
  getCourierGroups: z.object({}),

  // GET /api/shipping/courier-detail?code=jne
  getCourierDetail: z.object({
    query: z.object({
      code: z.string().min(1, 'Courier code wajib diisi'),
    }),
  }),

  // POST /api/shipping/courier-preference
  setCourierPreference: z.object({
    body: z.object({
      services: z.array(z.string()).nullable().optional(),
    }),
  }),

  // POST /api/shipping/track/express
  // order_id bisa berupa Order ID atau AWB (maks 20 karakter)
  trackOrderExpress: z.object({
    body: z.object({
      order_id: z.string().min(1, 'order_id wajib diisi').max(20, 'order_id maksimal 20 karakter'),
    }),
  }),
};
