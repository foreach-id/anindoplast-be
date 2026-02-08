import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const userSchemas = {
  // Schema untuk membuat user baru
  createUser: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.nativeEnum(UserRole).optional().default(UserRole.ADMIN),
    }),
  }),

  // Schema untuk update user lain (oleh Super Admin)
  updateUser: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      name: z.string().min(3).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(), // Optional, diisi jika ingin ganti password
      role: z.nativeEnum(UserRole).optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  // Schema untuk update profil sendiri
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(3).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
    }),
  }),

  // Schema validasi parameter ID
  userIdParam: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  // Schema untuk query params (pagination & search)
  queryParams: z.object({
    query: z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
      search: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
      isActive: z.string().optional().transform((val) => val === 'true'),
    }),
  }),
};