# Soft Delete Implementation Guide

## Overview

Soft delete telah diimplementasikan pada model User menggunakan field `deletedAt`. Ketika user di-delete, data tidak benar-benar dihapus dari database, melainkan field `deletedAt` akan diisi dengan timestamp saat delete dilakukan.

## Schema Changes

### Field `deletedAt` di Prisma Schema

```prisma
model User {
  id           Int       @id @default(autoincrement())
  name         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(255)
  password     String    @db.VarChar(255)
  role         UserRole  @default(user)
  isActive     Boolean   @default(true) @map("is_active")
  lastLogin    DateTime? @map("last_login") @db.DateTime(0)
  refreshToken String?   @map("refresh_token") @db.Text
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at") @db.DateTime(0)  // ✨ New field

  @@map("users")
}
```

## Migration Setup

### 1. Pastikan MySQL Server Berjalan

Sebelum menjalankan migration, pastikan MySQL server sudah berjalan:

```bash
# macOS (via Homebrew)
brew services start mysql

# atau
mysql.server start

# Cek status
brew services list | grep mysql
```

### 2. Pastikan Database Sudah Ada

Buat database jika belum ada:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS db_photo;
SHOW DATABASES;
EXIT;
```

### 3. Jalankan Migration

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migration
npm run prisma:migrate -- --name add_deleted_at_to_users

# Cek status migration
npm run prisma:migrate -- status
```

## Service Implementation

### Modified Methods

#### 1. `getAllUsers()`

- **Filter**: Hanya menampilkan user yang `deletedAt = null`
- **Response**: Includes `deletedAt` field

```typescript
const whereCondition = search
  ? {
      OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }],
      deletedAt: null, // ✨ Filter non-deleted users
    }
  : { deletedAt: null };
```

#### 2. `getUserById()`

- **Filter**: Hanya mengambil user yang `deletedAt = null`
- **Method Changed**: `findUnique` → `findFirst` (untuk support where filter)

#### 3. `createUser()`

- **Check Email**: Hanya cek email yang belum di-delete
- **Response**: Includes `deletedAt` field (akan null saat create)

#### 4. `updateUser()`

- **Filter**: Hanya update user yang `deletedAt = null`
- **Check Email**: Hanya cek email yang belum di-delete
- **Response**: Includes `deletedAt` field

#### 5. `deleteUser()` - **SOFT DELETE**

- **Before**: Set `isActive = false`
- **Now**: Set `deletedAt = new Date()`
- **Filter**: Hanya delete user yang belum di-delete (`deletedAt = null`)

```typescript
// Soft delete: set deletedAt to current timestamp
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() },
});
```

#### 6. `restoreUser()` - **NEW METHOD**

- **Purpose**: Restore user yang sudah di-delete
- **Filter**: Hanya restore user yang `deletedAt ≠ null`
- **Action**: Set `deletedAt = null`

```typescript
static async restoreUser(userId: number): Promise<UserResponseDTO> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: { not: null }, // Only restore deleted users
    },
  });

  if (!user) {
    throw {
      message: 'User not found or not deleted',
      errorCode: errorCodes.USER_NOT_FOUND,
      statusCode: 404,
    };
  }

  const restoredUser = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return restoredUser;
}
```

#### 7. `permanentDeleteUser()` - Hard Delete

- **No Change**: Tetap menghapus data secara permanen dari database
- **Use Case**: Untuk benar-benar menghapus data (GDPR compliance, dll)

#### 8. `updatePassword()`

- **Filter**: Hanya update password untuk user yang `deletedAt = null`

#### 9. `getUserStats()`

- **Added Filter**: Semua count filter dengan `deletedAt = null`
- **New Stat**: `deleted` - count user yang ter-delete
- **Returns**:
  ```typescript
  {
    total: number,        // Total non-deleted users
    active: number,       // Active & non-deleted users
    inactive: number,     // Inactive & non-deleted users
    deleted: number,      // Deleted users ✨ NEW
    admins: number,       // Admin users (non-deleted)
    regularUsers: number  // Non-admin users (non-deleted)
  }
  ```

## API Endpoints

### Existing Endpoints (Updated Behavior)

```bash
# Get all users (only non-deleted)
GET /api/users?page=1&limit=10&search=john

# Get user by ID (only non-deleted)
GET /api/users/:id

# Create user
POST /api/users

# Update user (only non-deleted)
PUT /api/users/:id

# Soft delete user
DELETE /api/users/:id

# Permanently delete user
DELETE /api/users/:id/permanent

# Get user statistics (includes deleted count)
GET /api/users/stats
```

### New Endpoint Needed

Untuk restore user, Anda perlu menambahkan endpoint baru:

```typescript
// In user.routes.ts
router.post('/:id/restore', authMiddleware, validateRequest(userSchemas.userIdParam), UserController.restoreUser);
```

```typescript
// In user.controller.ts
static async restoreUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as UserIdParamDTO;
    const userId = Number(id);

    const user = await UserService.restoreUser(userId);

    ResponseHandler.success(res, user, 'User restored successfully', 200);
  } catch (error) {
    ResponseHandler.error(res, error);
  }
}
```

## Type Updates

### `UserResponseDTO`

```typescript
export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // ✨ Added
}
```

## Benefits of Soft Delete

1. **Data Recovery**: User yang terhapus dapat di-restore
2. **Audit Trail**: Tetap menyimpan history data
3. **Referential Integrity**: Tidak break foreign key relationships
4. **Compliance**: Memenuhi requirement untuk data retention
5. **Safe Operations**: Menghindari accidental data loss

## Important Notes

### Email Uniqueness

- Email unique constraint tetap berlaku untuk semua user (termasuk yang deleted)
- Jika ingin membuat user baru dengan email yang sama dengan user yang di-delete, ada 2 opsi:
  1. Restore user yang lama
  2. Permanently delete user yang lama terlebih dahulu

### Migration Workflow

```bash
# 1. Pastikan DATABASE_URL sudah diset di .env
DATABASE_URL="mysql://root:@localhost:3306/db_photo"

# 2. Generate Prisma Client setelah schema change
npm run prisma:generate

# 3. Jalankan migration
npm run prisma:migrate -- --name add_deleted_at_to_users

# 4. (Optional) Cek migration status
npm run prisma:migrate -- status

# 5. Build & run aplikasi
npm run build
npm run dev
```

### Testing Soft Delete

```bash
# 1. Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'

# 2. Get users (should show the user)
curl http://localhost:3000/api/users

# 3. Soft delete the user
curl -X DELETE http://localhost:3000/api/users/1

# 4. Get users (should NOT show the deleted user)
curl http://localhost:3000/api/users

# 5. Restore the user
curl -X POST http://localhost:3000/api/users/1/restore

# 6. Get users (should show the user again)
curl http://localhost:3000/api/users
```

## Database Query Examples

### Melihat semua users termasuk yang deleted

```sql
SELECT id, name, email, deleted_at, created_at
FROM users;
```

### Melihat hanya users yang deleted

```sql
SELECT id, name, email, deleted_at, created_at
FROM users
WHERE deleted_at IS NOT NULL;
```

### Melihat hanya users yang tidak deleted

```sql
SELECT id, name, email, deleted_at, created_at
FROM users
WHERE deleted_at IS NULL;
```

### Manual restore user

```sql
UPDATE users
SET deleted_at = NULL
WHERE id = 1;
```

### Manual soft delete user

```sql
UPDATE users
SET deleted_at = NOW()
WHERE id = 1;
```

## Future Enhancements

1. **Global Middleware**: Create a global Prisma middleware to automatically filter `deletedAt = null` on all queries
2. **Bulk Operations**: Implement bulk soft delete and restore
3. **Delete Cascade**: Handle soft delete cascade untuk related entities
4. **Scheduled Cleanup**: Cron job untuk permanent delete users yang sudah lama di-delete
5. **Admin Panel**: UI untuk melihat dan restore deleted users

## Troubleshooting

### Error: "P1001: Can't reach database server"

- Pastikan MySQL server berjalan: `brew services start mysql`
- Check port: `lsof -i :3306`

### Error: "P1003: Database does not exist"

- Create database: `CREATE DATABASE db_photo;`

### Error: TypeScript errors about `deletedAt`

- Regenerate Prisma Client: `npm run prisma:generate`
- Rebuild: `npm run build`

### Migration sudah jalan tapi TypeScript error

- Pastikan `npm run prisma:generate` sudah dijalankan setelah migration
- Delete `node_modules/@prisma/client` dan run `npm install` ulang

---

**Last Updated**: January 27, 2026
