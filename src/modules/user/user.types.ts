import { z } from 'zod';
import { userSchemas } from './user.schema';
import { UserRole } from '@prisma/client';

// --- DTO Input (dari Zod Schema) ---

export type CreateUserDTO = z.infer<typeof userSchemas.createUser>['body'];

// Mengambil tipe dari schema update (body)
export type UpdateUserDTO = z.infer<typeof userSchemas.updateUser>['body'];

// Mengambil tipe dari schema query params
export type UserQueryDTO = z.infer<typeof userSchemas.queryParams>['query'];

// --- Tambahan Manual (Non-Zod) ---

export interface UserIdParamDTO {
  id: number;
}

export interface UserProfileDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface response user umum
export interface UserResponseDTO extends UserProfileDTO {}

// Interface untuk list user (pagination)
export interface UsersListResponseDTO {
  users: UserResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Alias untuk update profile sendiri (jika diperlukan)
export type UpdateProfileDTO = z.infer<typeof userSchemas.updateProfile>['body'];