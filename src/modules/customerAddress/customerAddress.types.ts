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
  address: string;
  zipCode: string;
  provinceId: number;
  provinceName: string;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  subDistrictId: number;
  subDistrictName: string;
  customerId: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
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
