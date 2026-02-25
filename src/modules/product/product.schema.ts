import { z } from 'zod';

export const productSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      sku: z.string().min(3, 'SKU must be at least 3 characters'),
      price: z.number().min(0, 'Price cannot be negative'),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      weight: z.number().int().nonnegative().optional(),
      width: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
      length: z.number().nonnegative().optional(),
      categoryId: z.number().int().positive().min(1, 'Category Id must be filled'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters').optional(),
      sku: z.string().min(3, 'SKU must be at least 3 characters').optional(),
      price: z.number().min(0, 'Price cannot be negative').optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      weight: z.number().int().nonnegative().optional(),
      width: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
      length: z.number().nonnegative().optional(),
      categoryId: z.number().int().positive().min(1, 'Category Id must be filled'),
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
