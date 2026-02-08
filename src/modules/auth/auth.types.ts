import { z } from 'zod';
import { authSchemas } from './auth.schema';
import { UserRole } from '@prisma/client';

// --- DTO Input (dari Zod Schema) ---
export type LoginDTO = z.infer<typeof authSchemas.login>['body'];
export type RefreshTokenDTO = z.infer<typeof authSchemas.refreshToken>['body'];

// --- Response DTOs ---

export interface AuthResponseDTO {
  user: {
    id: number;
    email: string;
    name: string;
    role: string | UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

// Alias untuk kompatibilitas
export type LoginResponseDTO = AuthResponseDTO;

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

// --- Internal / Payload DTOs ---

export interface TokenPayloadDTO {
  id: number;
  email: string;
  role: string | UserRole;
}

export interface CurrentUserDTO {
  id: number;
  email: string;
  role: string | UserRole;
}