# DTO Implementation Guide

Proyek ini menggunakan **DTO (Data Transfer Objects)** pattern dengan **Zod** untuk validasi dan type safety.

## 📁 Struktur File per Module

```
src/modules/{moduleName}/
├── {module}.controller.ts   # Request handlers (menggunakan DTOs)
├── {module}.service.ts      # Business logic (menggunakan DTOs)
├── {module}.routes.ts       # Route definitions (menggunakan schemas)
├── {module}.schema.ts       # Zod validation schemas ✨
├── {module}.types.ts        # TypeScript DTOs (extracted from schemas) ✨
└── index.ts                 # Module exports
```

## 🎯 File Descriptions

### `*.schema.ts` - Zod Schemas (Runtime Validation)

Mendefinisikan struktur data dan aturan validasi menggunakan Zod.

**Contoh:**

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    password: z.string().min(6),
  }),
});

export const userSchemas = {
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  // ... other schemas
};
```

### `*.types.ts` - DTOs (Compile-time Types)

Type definitions yang di-extract dari Zod schemas menggunakan `z.infer`.

**Contoh:**

```typescript
import { z } from 'zod';
import { userSchemas } from './user.schema';

// Request DTOs (dari Zod schemas)
export type CreateUserDTO = z.infer<typeof userSchemas.createUser>['body'];
export type UpdateUserDTO = z.infer<typeof userSchemas.updateUser>['body'];

// Response DTOs (manual definitions)
export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  // ... other fields
}
```

## 🔄 Data Flow

```
Request → Schema Validation → DTO → Controller → Service → Response DTO
```

### 1️⃣ **Routes** - Validasi dengan Schema

```typescript
import { userSchemas } from './user.schema';
import { validate } from '@middleware/validateRequest';

router.post(
  '/',
  authenticate,
  validate(userSchemas.createUser), // ← Zod validation
  UserController.createUser,
);
```

### 2️⃣ **Controller** - Gunakan DTOs

```typescript
import { CreateUserDTO, UserResponseDTO } from './user.types';

class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    const userData: CreateUserDTO = req.body; // ← Type-safe!
    const user = await UserService.createUser(userData);
    ResponseHandler.success(res, user, 'User created');
  }
}
```

### 3️⃣ **Service** - Return DTOs

```typescript
import { CreateUserDTO, UserResponseDTO } from './user.types';

class UserService {
  static async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    const user = await prisma.user.create({ data });
    return user; // ← Type-safe response
  }
}
```

## ✅ Benefits

1. **Single Source of Truth** - Schema Zod adalah satu-satunya definisi
2. **Type Safety** - Full TypeScript support
3. **Runtime Validation** - Data tervalidasi saat runtime
4. **Auto-complete** - IDE suggestions untuk semua DTOs
5. **Refactoring Safe** - Perubahan schema otomatis update types
6. **Self-Documenting** - Code menjadi dokumentasi

## 📝 Naming Conventions

### Request DTOs

- `CreateXxxDTO` - untuk create/POST requests
- `UpdateXxxDTO` - untuk update/PUT/PATCH requests
- `XxxQueryDTO` - untuk query parameters
- `XxxParamDTO` - untuk URL parameters

### Response DTOs

- `XxxResponseDTO` - untuk single item response
- `XxxListResponseDTO` - untuk list/array response
- `XxxDetailDTO` - untuk detailed view

## 🔗 Module Exports

Setiap module meng-export schemas dan types:

```typescript
// src/modules/user/index.ts
export { userSchemas } from './user.schema';
export * from './user.types';
```

Import di file lain:

```typescript
import { userSchemas, CreateUserDTO, UserResponseDTO } from '@modules/user';
```

## 🎨 Best Practices

1. **Pisahkan Request dan Response DTOs**
   - Request DTOs dari Zod schemas
   - Response DTOs sebagai interfaces

2. **Gunakan transformations** untuk data parsing

   ```typescript
   z.string().transform((val) => parseInt(val, 10));
   ```

3. **Reuse schemas** untuk konsistensi

   ```typescript
   const baseUserSchema = z.object({ ... });
   const createUserSchema = baseUserSchema.extend({ ... });
   ```

4. **Export grouped schemas**
   ```typescript
   export const userSchemas = {
     create: createUserSchema,
     update: updateUserSchema,
   };
   ```

## 📚 Available DTOs

### Auth Module

- `RegisterDTO`, `LoginDTO`, `RefreshTokenDTO`
- `AuthResponseDTO`, `AuthUserDTO`, `TokenPayloadDTO`

### User Module

- `CreateUserDTO`, `UpdateUserDTO`, `UpdateProfileDTO`
- `UserResponseDTO`, `UsersListResponseDTO`, `UserProfileDTO`
- `UserQueryDTO`, `UserIdParamDTO`

---

**Migration Status:** ✅ Complete - All modules migrated to DTO pattern
