import { UserRole } from '@prisma/client';

// ==================== Legacy Interfaces (Deprecated) ====================

/** @deprecated Use UserResponseDTO from @modules/user instead */
export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber: string;
}

/** @deprecated Use UserResponseDTO from @modules/user instead */
export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated Use RegisterDTO from @modules/auth instead */
export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

/** @deprecated Use LoginDTO from @modules/auth instead */
export interface ILoginInput {
  email: string;
  password: string;
}

/** @deprecated Use TokenPayloadDTO from @modules/auth instead */
export interface ITokenPayload {
  id: number;
  email: string;
  role: UserRole;
}

/** @deprecated Use AuthResponseDTO from @modules/auth instead */
export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

// ==================== Re-export DTOs (FIXED) ====================

export type {
  LoginDTO,
  AuthResponseDTO,
  RefreshTokenResponseDTO,
  CurrentUserDTO,
  TokenPayloadDTO
} from '@modules/auth/auth.types';

export type { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UpdateProfileDTO, 
  UserIdParamDTO, 
  UserQueryDTO, 
  UserResponseDTO, 
  UsersListResponseDTO, 
  UserProfileDTO 
} from '@modules/user/user.types';