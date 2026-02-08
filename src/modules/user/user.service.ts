import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { CreateUserDTO, UpdateUserDTO, UserQueryDTO } from './user.types';
import { messages } from '../../constants';

export class UserService {
  // Helper: Hapus password dari object user sebelum dikirim ke response
  private static excludePassword(user: any) {
    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async createUser(data: CreateUserDTO) {
    // 1. Cek email duplikat
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error(messages.ERROR.EMAIL_ALREADY_EXISTS);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Simpan ke DB
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        isActive: true, // Default aktif
      },
    });

    return this.excludePassword(newUser);
  }

  static async getUsers(query: UserQueryDTO) {
      // 1. KONVERSI TIPE DATA (PENTING!)
      // req.query mengirim string, kita harus paksa jadi Number
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Destructure sisa property
      const { search, role, isActive } = query;

      // 2. Filter Dinamis
      const whereClause: any = {};
      
      if (search) {
        whereClause.OR = [
          { name: { contains: search } }, 
          { email: { contains: search } },
        ];
      }

      if (role) {
          whereClause.role = role;
      }

      // 3. Handle Boolean (String "true"/"false" -> Boolean true/false)
      if (isActive !== undefined) {
          // Konversi string "true"/"false" ke boolean jika perlu
          const isActiveStr = String(isActive);
          if (isActiveStr === 'true') whereClause.isActive = true;
          if (isActiveStr === 'false') whereClause.isActive = false;
          // Jika sudah boolean (dari Zod coerce), code di atas tetap aman
      }

      // 4. Execute Transaction
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where: whereClause,
          skip: skip,  // Sekarang sudah pasti Number (Int)
          take: limit, // Sekarang sudah pasti Number (Int)
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return {
        users: users.map((u) => this.excludePassword(u)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error(messages.ERROR.USER_NOT_FOUND);
    return this.excludePassword(user);
  }

  static async updateUser(id: number, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error(messages.ERROR.USER_NOT_FOUND);

    // Jika ganti email, cek duplikat
    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new Error(messages.ERROR.EMAIL_ALREADY_EXISTS);
    }

    // Jika ganti password, hash ulang
    let updatedData: any = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    return this.excludePassword(updatedUser);
  }

  // Deactivate User (Soft Delete ala User Management)
  static async deleteUser(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error(messages.ERROR.USER_NOT_FOUND);

    // Kita tidak menghapus record, tapi mematikan akses (isActive = false)
    // agar relasi audit log (createdBy, dll) tidak rusak/hilang.
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Restore User (Set isActive = true)
  static async restoreUser(id: number) {
    // 1. Cek apakah user ada
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error(messages.ERROR.USER_NOT_FOUND);

    // 2. Aktifkan kembali (isActive = true)
    const restoredUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return this.excludePassword(restoredUser);
  }
}