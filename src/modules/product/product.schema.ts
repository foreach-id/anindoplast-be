import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama produk minimal 3 karakter"),
    sku: z.string().min(3, "SKU minimal 3 karakter"),
    price: z.number().min(0, "Harga tidak boleh negatif"),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    // Dimensi
    weight: z.number().int().nonnegative().optional(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    length: z.number().nonnegative().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: createProductSchema.shape.body.partial(),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ProductQueryInput = z.infer<typeof productQuerySchema>['query'];
export type ProductIdInput = z.infer<typeof productIdSchema>['params'];