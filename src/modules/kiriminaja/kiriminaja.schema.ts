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
};
