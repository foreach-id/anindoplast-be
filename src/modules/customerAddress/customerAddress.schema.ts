import { z } from 'zod';

export const customerAddressSchemas = {
  create: z.object({
    body: z.object({
      districtId: z.number().int().min(1, 'District is required'),
      customerId: z.number().int().min(1, 'Customer is required'),
      address: z.string().min(3, 'Address must be at least 3 characters'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      districtId: z.number().int().min(1, 'District is required'),
      customerId: z.number().int().min(1, 'Customer is required'),
      address: z.string().min(3, 'Address must be at least 3 characters'),
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
    }),
  }),
};
