import { z } from 'zod';
import { paymentMethodSchemas } from './paymentMethod.schema';

export type CreatePaymentMethodDTO = z.infer<typeof paymentMethodSchemas.create>['body'];

export type UpdatePaymentMethodDTO = z.infer<typeof paymentMethodSchemas.update>['body'];

export type PaymentMethodQueryDTO = z.infer<typeof paymentMethodSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface PaymentMethodIdParamDTO {
  id: number;
}

export interface PaymentMethodDTO {
  id: number;
  name: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PaymentMethodsListResponseDTO {
  data: PaymentMethodDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
