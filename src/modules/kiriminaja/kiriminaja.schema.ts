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
      origin: z.number().int().positive('Origin kecamatan ID wajib diisi'),
      destination: z.number().int().positive('Destination kecamatan ID wajib diisi'),
      weight: z.number().int().positive('Berat harus lebih dari 0 gram'),
      itemValue: z.number().nonnegative('Nilai barang tidak boleh negatif'),
      insurance: z.number().int().min(0).max(1).optional().default(0),
      courier: z.array(z.string()).optional(),
    }),
  }),
};
