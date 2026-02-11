import { z } from 'zod';

export const receiptSchemas = {
  generateReceipt: z.object({
    body: z.object({
      deliveryNumber: z.string().min(1, 'Delivery number must be at least 1 character'),
    }),
  }),
};
