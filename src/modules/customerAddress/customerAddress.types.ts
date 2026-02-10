import { z } from 'zod';
import { customerAddressSchemas } from './customerAddress.schema';

export type CreateCustomerAddressDTO = z.infer<typeof customerAddressSchemas.create>['body'];

export type UpdateCustomerAddressDTO = z.infer<typeof customerAddressSchemas.update>['body'];

export type CustomerAddressQueryDTO = z.infer<typeof customerAddressSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface CustomerAddressIdParamDTO {
  id: number;
}

export interface CustomerAddressDTO {
  id: number;
  name: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CustomerAddresssListResponseDTO {
  data: CustomerAddressDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
