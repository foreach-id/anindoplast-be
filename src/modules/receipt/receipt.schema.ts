import { z } from 'zod';

export const receiptSchemas = {
  generateReceipt: z.object({
    body: z.object({
      deliveryNumber: z.array(z.string().min(1, 'Delivery number must be at least 1 character')).min(1, 'At least one delivery number is required'),
    }),
  }),
};
