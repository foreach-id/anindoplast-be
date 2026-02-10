import { z } from 'zod';
import { customerSchemas } from './customer.schema';

export type CreateCustomerDTO = z.infer<typeof customerSchemas.create>['body'];

export type UpdateCustomerDTO = z.infer<typeof customerSchemas.update>['body'];

export type CustomerQueryDTO = z.infer<typeof customerSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface CustomerIdParamDTO {
  id: number;
}

export interface CustomerDTO {
  id: number;
  name: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CustomersListResponseDTO {
  data: CustomerDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
