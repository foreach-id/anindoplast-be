import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { serviceExpeditionSchemas } from './serviceExpedition.schema';

export type CreateServiceExpeditionDTO = z.infer<typeof serviceExpeditionSchemas.create>['body'];

export type UpdateServiceExpeditionDTO = z.infer<typeof serviceExpeditionSchemas.update>['body'];

export type ServiceExpeditionQueryDTO = z.infer<typeof serviceExpeditionSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface ServiceExpeditionIdParamDTO {
  id: number;
}

export interface ServiceExpeditionProfileDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceExpeditionResponseDTO extends ServiceExpeditionProfileDTO {}

export interface ServiceExpeditionsListResponseDTO {
  data: ServiceExpeditionResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
