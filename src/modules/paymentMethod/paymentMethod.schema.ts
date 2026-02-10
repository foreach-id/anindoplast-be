import { z } from 'zod';

export const paymentMethodSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
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
