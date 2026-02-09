import { z } from 'zod';

export const serviceExpeditionSchemas = {
  create: z.object({
    body: z.object({
      code: z.string().min(1, 'Code must be at least 1 character'),
      name: z.string().min(3, 'Name must be at least 3 characters'),
      desc: z.string().optional(),
      shippingCodPercent: z.number().min(0).max(100).optional(),
      shippingCostPercent: z.number().min(0).max(100).optional(),
      shippingHandlingCostPercent: z.number().min(0).max(100).optional(),
      expeditionId: z.number().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      code: z.string().min(1, 'Code must be at least 1 character'),
      name: z.string().min(3, 'Name must be at least 3 characters'),
      desc: z.string().optional(),
      shippingCodPercent: z.number().min(0).max(100).optional(),
      shippingCostPercent: z.number().min(0).max(100).optional(),
      shippingHandlingCostPercent: z.number().min(0).max(100).optional(),
      expeditionId: z.number().optional(),
    }),
  }),

  idParam: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  queryParams: z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
      search: z.string().optional(),
      isActive: z
        .string()
        .optional()
        .transform((val) => val === 'true'),
    }),
  }),
};
