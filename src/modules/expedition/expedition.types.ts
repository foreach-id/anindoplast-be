import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { expeditionSchemas } from './expedition.schema';

export type CreateExpeditionDTO = z.infer<typeof expeditionSchemas.create>['body'];

export type UpdateExpeditionDTO = z.infer<typeof expeditionSchemas.update>['body'];

export type ExpeditionQueryDTO = z.infer<typeof expeditionSchemas.queryParams>['query'];

// NON-ZOD TYPES
export interface ExpeditionIdParamDTO {
  id: number;
}

export interface ExpeditionProfileDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpeditionResponseDTO extends ExpeditionProfileDTO {}

export interface ExpeditionsListResponseDTO {
  data: ExpeditionResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
