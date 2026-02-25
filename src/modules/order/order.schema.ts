import { z } from 'zod';

export const orderSchemas = {
  create: z.object({
    body: z.object({
      customerId: z.number().int().min(1, 'Customer is required'),
      customerAddressId: z.number().int().min(1, 'Customer address is required'),
      paymentMethodId: z.number().int().min(1, 'Payment method is required'),
      service: z.string().optional(),
      serviceName: z.string().optional(),
      serviceType: z.string().optional(),
      isCod: z.boolean().default(false),
      isDropOff: z.boolean().default(false),
      shippingCost: z.number().min(0).default(0),
      notes: z.string().optional(),

      // Nested OrderItems
      items: z
        .array(
          z.object({
            productId: z.number().int().min(1, 'Product ID is required'),
            quantity: z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: z.number().min(0, 'Unit price cannot be negative'),
          }),
        )
        .min(1, 'Order must have at least 1 item'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      customerId: z.number().int().min(1, 'Customer is required').optional(),
      customerAddressId: z.number().int().min(1, 'Customer address is required').optional(),
      paymentMethodId: z.number().int().min(1, 'Payment method is required').optional(),
      service: z.string().optional(),
      serviceName: z.string().optional(),
      serviceType: z.string().optional(),
      isCod: z.boolean().optional(),
      isDropOff: z.boolean().default(false),
      shippingCost: z.number().min(0).optional(),
      notes: z.string().optional(),
      items: z
        .array(
          z.object({
            id: z.number().int().optional(),
            productId: z.number().int().min(1, 'Product ID is required'),
            quantity: z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: z.number().min(0, 'Unit price cannot be negative'),
          }),
        )
        .optional(),
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
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
      customerId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    }),
  }),
};
