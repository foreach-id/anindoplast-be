import { PrismaClient, UserRole } from '@prisma/client'; // Import Enum
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Buat SUPER ADMIN (God Mode User)
  const superAdminEmail = 'super@admin.com';
  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Super Administrator',
        email: superAdminEmail,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN, // KUNCINYA DI SINI
        isActive: true,
      },
    });
    console.log('✅ Super Admin created: super@admin.com / password123');
  }

  // 2. Buat Admin Biasa (Opsional, untuk tes)
  const adminEmail = 'admin@store.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Staff Admin Gudang',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN, // Admin biasa
        isActive: true,
      },
    });
    console.log('✅ Admin created: admin@store.com / password123');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });