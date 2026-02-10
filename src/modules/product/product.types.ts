import { z } from 'zod';
import { productSchemas } from './product.schema';

export type CreateProductDTO = z.infer<typeof productSchemas.create>['body'];

export type UpdateProductDTO = z.infer<typeof productSchemas.update>['body'];

export type ProductQueryDTO = z.infer<typeof productSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface ProductIdParamDTO {
  id: number;
}

export interface ProductDTO {
  id: number;
  name: string;
  sku: string;
  price: number;
  description?: string;
  isActive: boolean;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy: number;
  updatedBy?: number | null;
  deletedBy?: number | null;
}

export interface ProductResponseDTO extends ProductDTO {
  creator?: {
    id: number;
    name: string;
  };
  updater?: {
    id: number;
    name: string;
  } | null;
}

export interface ProductsListResponseDTO {
  data: ProductResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}