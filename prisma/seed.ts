import { PrismaClient } from '@prisma/client'; 
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. CREATE USER (ADMIN)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@anindoplast.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@anindoplast.com',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ User created: ${admin.email}`);

  // 2. CREATE PAYMENT METHOD
  const paymentBCA = await prisma.paymentMethod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Transfer Bank BCA',
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Payment Method created: ${paymentBCA.name}`);

  // 3. CREATE EXPEDITION & SERVICE
  const expeditionJNE = await prisma.expedition.upsert({
    where: { code: 'JNE' },
    update: {},
    create: {
      name: 'Jalur Nugraha Ekakurir (JNE)',
      code: 'JNE',
      isActive: true,
    },
  });

  const serviceREG = await prisma.serviceExpedition.upsert({
    where: { code: 'JNE-REG' },
    update: {},
    create: {
      name: 'JNE Reguler',
      code: 'JNE-REG',
      description: 'Estimasi 2-3 Hari',
      expeditionId: expeditionJNE.id,
      shippingCodPercent: 0,
      shippingCostPercent: 0,
      shippingHandlingCostPercent: 0,
      isActive: true,
    },
  });
  console.log(`✅ Expedition Service created: ${serviceREG.code}`);

  // 4. CREATE PRODUCTS
  const product1 = await prisma.product.upsert({
    where: { sku: 'PROD-001' },
    update: {},
    create: {
      name: 'Botol Plastik 500ml',
      sku: 'PROD-001',
      price: 2500.00,
      description: 'Botol plastik higienis ukuran sedang',
      weight: 50,
      width: 5,
      height: 20,
      length: 5,
      createdBy: admin.id,
      isActive: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'PROD-002' },
    update: {},
    create: {
      name: 'Galon Air 19L',
      sku: 'PROD-002',
      price: 35000.00,
      description: 'Galon kuat dan tahan banting',
      weight: 1000,
      width: 30,
      height: 50,
      length: 30,
      createdBy: admin.id,
      isActive: true,
    },
  });
  console.log(`✅ Products created: ${product1.sku}, ${product2.sku}`);

  // 5. CREATE CUSTOMER
  const customer = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Budi Santoso',
      phone: '081234567890',
      countryCode: 'ID',
      createdBy: admin.id,
    },
  });
  console.log(`✅ Customer created: ${customer.name}`);

  // 6. CREATE CUSTOMER ADDRESS
  // Kita hapus variabel 'address' karena tidak dipakai di console log
  await prisma.customerAddress.upsert({
    where: { id: 1 },
    update: {},
    create: {
      customerId: customer.id,
      address: 'Jl. Sudirman No. 45, Jakarta Pusat',
      districtId: 101,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Address created for customer: ${customer.name}`);

  console.log('🚀 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });