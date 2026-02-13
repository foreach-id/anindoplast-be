import { PrismaClient, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seeding for statistics...');

  // =====================================================
  // 1. CREATE USERS
  // =====================================================
  console.log('\n📝 Creating users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const superAdmin = await prisma.user.upsert({
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
  console.log(`✅ User created: ${superAdmin.email}`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin.gudang@store.com' },
    update: {},
    create: {
      name: 'Admin Gudang',
      email: 'admin.gudang@store.com',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ User created: ${admin.email}`);

  // =====================================================
  // 2. CREATE PAYMENT METHODS
  // =====================================================
  console.log('\n💳 Creating payment methods...');
  const paymentMethods = [
    { name: 'Transfer Bank BCA', createdBy: superAdmin.id },
    { name: 'Transfer Bank Mandiri', createdBy: superAdmin.id },
    { name: 'COD (Cash on Delivery)', createdBy: superAdmin.id },
    { name: 'QRIS', createdBy: superAdmin.id },
  ];

  const createdPaymentMethods = [];
  for (const pm of paymentMethods) {
    const created = await prisma.paymentMethod.upsert({
      where: { id: paymentMethods.indexOf(pm) + 1 },
      update: {},
      create: {
        ...pm,
        isActive: true,
      },
    });
    createdPaymentMethods.push(created);
    console.log(`✅ Payment Method: ${created.name}`);
  }

  // =====================================================
  // 3. CREATE EXPEDITIONS & SERVICES
  // =====================================================
  console.log('\n🚚 Creating expeditions...');
  const expeditions = [
    { code: 'JNE', name: 'Jalur Nugraha Ekakurir (JNE)' },
    { code: 'JNT', name: 'J&T Express' },
    { code: 'SICEPAT', name: 'SiCepat' },
    { code: 'ANTERAJA', name: 'AnterAja' },
  ];

  const createdExpeditions = [];
  for (const exp of expeditions) {
    const created = await prisma.expedition.upsert({
      where: { code: exp.code },
      update: {},
      create: {
        ...exp,
        isActive: true,
      },
    });
    createdExpeditions.push(created);
    console.log(`✅ Expedition: ${created.name}`);
  }

  // Create Services for each expedition
  console.log('\n📦 Creating expedition services...');
  const services = [
    {
      code: 'JNE-REG',
      name: 'JNE Reguler',
      description: 'Estimasi 2-3 Hari',
      expeditionId: createdExpeditions[0].id,
      shippingCodPercent: 0,
      shippingCostPercent: 0,
      shippingHandlingCostPercent: 0,
    },
    {
      code: 'JNE-YES',
      name: 'JNE YES',
      description: 'Estimasi 1 Hari',
      expeditionId: createdExpeditions[0].id,
      shippingCodPercent: 0,
      shippingCostPercent: 0,
      shippingHandlingCostPercent: 0,
    },
    {
      code: 'JNT-REG',
      name: 'J&T Regular',
      description: 'Estimasi 2-3 Hari',
      expeditionId: createdExpeditions[1].id,
      shippingCodPercent: 0,
      shippingCostPercent: 0,
      shippingHandlingCostPercent: 0,
    },
    {
      code: 'SICEPAT-REG',
      name: 'SiCepat Regular',
      description: 'Estimasi 2-3 Hari',
      expeditionId: createdExpeditions[2].id,
      shippingCodPercent: 0,
      shippingCostPercent: 0,
      shippingHandlingCostPercent: 0,
    },
  ];

  const createdServices = [];
  for (const service of services) {
    const created = await prisma.serviceExpedition.upsert({
      where: { code: service.code },
      update: {},
      create: {
        ...service,
        isActive: true,
      },
    });
    createdServices.push(created);
    console.log(`✅ Service: ${created.name}`);
  }

  // =====================================================
  // 4. CREATE PRODUCTS
  // =====================================================
  console.log('\n📦 Creating products...');
  const products = [
    {
      name: 'Botol Plastik 500ml',
      sku: 'PROD-001',
      price: 2500.0,
      description: 'Botol plastik higienis ukuran sedang',
      weight: 50,
      width: 5,
      height: 20,
      length: 5,
    },
    {
      name: 'Galon Air 19L',
      sku: 'PROD-002',
      price: 35000.0,
      description: 'Galon kuat dan tahan banting',
      weight: 1000,
      width: 30,
      height: 50,
      length: 30,
    },
    {
      name: 'Gelas Plastik 240ml',
      sku: 'PROD-003',
      price: 1500.0,
      description: 'Gelas plastik sekali pakai',
      weight: 20,
      width: 7,
      height: 10,
      length: 7,
    },
    {
      name: 'Sedotan Plastik Pack 100',
      sku: 'PROD-004',
      price: 8000.0,
      description: 'Sedotan plastik pack isi 100',
      weight: 150,
      width: 10,
      height: 3,
      length: 25,
    },
    {
      name: 'Tempat Makan 1000ml',
      sku: 'PROD-005',
      price: 15000.0,
      description: 'Tempat makan plastik dengan tutup',
      weight: 200,
      width: 15,
      height: 8,
      length: 20,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
        isActive: true,
      },
    });
    createdProducts.push(created);
    console.log(`✅ Product: ${created.name}`);
  }

  // =====================================================
  // 5. CREATE CUSTOMERS
  // =====================================================
  console.log('\n👥 Creating customers...');
  const customers = [
    { name: 'Budi Santoso', phone: '081234567890', countryCode: 'ID' },
    { name: 'Siti Nurhaliza', phone: '082345678901', countryCode: 'ID' },
    { name: 'Andi Wijaya', phone: '083456789012', countryCode: 'ID' },
    { name: 'Dewi Lestari', phone: '084567890123', countryCode: 'ID' },
    { name: 'Rudi Hartono', phone: '085678901234', countryCode: 'ID' },
    { name: 'Maya Sari', phone: '086789012345', countryCode: 'ID' },
    { name: 'Bambang Sutrisno', phone: '087890123456', countryCode: 'ID' },
    { name: 'Lina Marlina', phone: '088901234567', countryCode: 'ID' },
  ];

  const createdCustomers = [];
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const created = await prisma.customer.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        ...customer,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
    createdCustomers.push(created);
    console.log(`✅ Customer: ${created.name}`);
  }

  // =====================================================
  // 6. CREATE CUSTOMER ADDRESSES
  // =====================================================
  console.log('\n🏠 Creating customer addresses...');
  const addresses = [
    'Jl. Sudirman No. 45, Jakarta Pusat',
    'Jl. Gatot Subroto No. 100, Jakarta Selatan',
    'Jl. Thamrin No. 25, Jakarta Pusat',
    'Jl. Kuningan No. 88, Jakarta Selatan',
    'Jl. Mangga Dua No. 12, Jakarta Utara',
    'Jl. Pluit No. 67, Jakarta Utara',
    'Jl. Cikini No. 34, Jakarta Pusat',
    'Jl. Pancoran No. 56, Jakarta Selatan',
  ];

  const createdAddresses = [];
  for (let i = 0; i < createdCustomers.length; i++) {
    const created = await prisma.customerAddress.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        customerId: createdCustomers[i].id,
        address: addresses[i],
        districtId: 100 + i + 1,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
    createdAddresses.push(created);
    console.log(`✅ Address for: ${createdCustomers[i].name}`);
  }

  // =====================================================
  // 7. CREATE ORDERS (REALISTIC DATA FOR STATISTICS)
  // =====================================================
  console.log('\n📊 Creating orders with various statuses and dates...');

  const now = new Date();

  // Helper function to generate random date in the past
  const getRandomDateInPast = (daysAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  // Helper to get random element
  const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  let orderCount = 0;

  // Create orders for the last 90 days
  for (let i = 0; i < 80; i++) {
    const customer = getRandom(createdCustomers);
    const address = createdAddresses.find((a) => a.customerId === customer.id)!;
    const paymentMethod = getRandom(createdPaymentMethods);
    const service = getRandom(createdServices);
    const orderDate = getRandomDateInPast(90);

    // Determine status based on how old the order is
    const daysOld = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    let status: OrderStatus;

    if (daysOld < 1) {
      status = getRandom(['PENDING', 'CONFIRMED'] as OrderStatus[]);
    } else if (daysOld < 3) {
      status = getRandom(['CONFIRMED', 'PROCESSING'] as OrderStatus[]);
    } else if (daysOld < 7) {
      status = getRandom(['PROCESSING', 'SHIPPED'] as OrderStatus[]);
    } else if (daysOld < 14) {
      status = getRandom(['SHIPPED', 'DELIVERED'] as OrderStatus[]);
    } else {
      // Older orders - mostly delivered, some cancelled
      status = Math.random() > 0.9 ? 'CANCELLED' : 'DELIVERED';
    }

    // Select 1-3 random products
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderProducts = [];
    for (let j = 0; j < numItems; j++) {
      const product = getRandom(createdProducts);
      const quantity = Math.floor(Math.random() * 5) + 1;
      orderProducts.push({
        product,
        quantity,
        unitPrice: Number(product.price),
      });
    }

    // Calculate totals
    const totalAmount = orderProducts.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingCost = Math.floor(Math.random() * 30000) + 10000; // 10k - 40k
    const grandTotal = totalAmount + shippingCost;

    // Create order with items
    const orderNumber = `AMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const deliveryNumber = `JX${Date.now()}${Math.floor(Math.random() * 10000)}`;

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          deliveryNumber,
          customerId: customer.id,
          customerAddressId: address.id,
          paymentMethodId: paymentMethod.id,
          serviceExpeditionId: service.id,
          orderDate,
          totalAmount,
          shippingCost,
          grandTotal,
          status,
          notes: Math.random() > 0.7 ? 'Harap hubungi sebelum dikirim' : null,
          createdBy: superAdmin.id,
          updatedBy: superAdmin.id,
          orderItems: {
            create: orderProducts.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.unitPrice * item.quantity,
            })),
          },
        },
      });

      orderCount++;
      console.log(
        `✅ Order ${orderCount}/80: ${order.orderNumber} - ${order.status} - Rp ${Number(order.grandTotal).toLocaleString('id-ID')} - ${orderDate.toISOString().split('T')[0]}`,
      );
    } catch (error) {
      console.error(`❌ Error creating order ${i + 1}:`, error);
    }
  }

  // =====================================================
  // 8. SUMMARY
  // =====================================================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING COMPLETED!');
  console.log('='.repeat(60));

  const summary = {
    users: await prisma.user.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    expeditions: await prisma.expedition.count(),
    services: await prisma.serviceExpedition.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    addresses: await prisma.customerAddress.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
  };

  console.log('\n📊 Database Summary:');
  console.log(`   Users: ${summary.users}`);
  console.log(`   Payment Methods: ${summary.paymentMethods}`);
  console.log(`   Expeditions: ${summary.expeditions}`);
  console.log(`   Services: ${summary.services}`);
  console.log(`   Products: ${summary.products}`);
  console.log(`   Customers: ${summary.customers}`);
  console.log(`   Addresses: ${summary.addresses}`);
  console.log(`   Orders: ${summary.orders}`);
  console.log(`   Order Items: ${summary.orderItems}`);

  // Order breakdown
  const orderBreakdown = await prisma.order.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  console.log('\n📈 Orders by Status:');
  orderBreakdown.forEach((item) => {
    console.log(`   ${item.status}: ${item._count.id}`);
  });

  // Revenue stats
  const revenueStats = await prisma.order.aggregate({
    where: {
      status: { not: 'CANCELLED' },
    },
    _sum: {
      grandTotal: true,
    },
  });

  console.log(`\n💰 Total Revenue: Rp ${Number(revenueStats._sum.grandTotal || 0).toLocaleString('id-ID')}`);

  console.log('\n✅ Ready to test statistics endpoints!');
  console.log('   GET /api/stats/dashboard');
  console.log('   GET /api/stats/sales');
  console.log('   GET /api/stats/products');
  console.log('   GET /api/stats/customers');
  console.log('   GET /api/stats/orders');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });