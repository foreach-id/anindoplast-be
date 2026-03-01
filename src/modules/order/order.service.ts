// src/modules/order/order.service.ts
import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateOrderDTO, UpdateOrderDTO, OrderQueryDTO } from './order.types';

export class OrderService {
  static async create(data: CreateOrderDTO, userId: number | undefined) {
    if (typeof userId !== 'number') {
      throw new Error('User ID is required for creating Order');
    }

    // 1. Validasi customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new Error('Customer not found');

    // 2. Validasi customer address
    const customerAddress = await prisma.customerAddress.findFirst({
      where: {
        id: data.customerAddressId,
        customerId: data.customerId,
      },
    });
    if (!customerAddress) throw new Error('Customer address not found or does not belong to customer');

    // 3. Validasi payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: data.paymentMethodId, deletedAt: null, isActive: true },
    });
    if (!paymentMethod) throw new Error('Payment method not found or inactive');

    // 4. Validasi products dan hitung total
    let totalAmount = 0;
    const itemsWithSubtotal = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, deletedAt: null, isActive: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found or inactive`);
        }

        const subtotal = item.quantity * item.unitPrice;
        totalAmount += subtotal;

        return {
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          productWeight: product.weight,
          productWidth: product.width,
          productHeight: product.height,
          productLength: product.length,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal,
        };
      }),
    );

    // 6. Hitung grand total
    const grandTotal = totalAmount + (data.shippingCost || 0) + (data.addCost || 0);

    // 7. Generate Order Number dan Delivery Number
    const orderNumber = `FOR-${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 8. Create Order + OrderItems dalam 1 transaksi (dengan snapshot data)
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,

        // Customer snapshot
        customerId: data.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerCountryCode: customer.countryCode,

        // Address snapshot
        customerAddressId: data.customerAddressId,
        customerAddressFull: customerAddress.address,
        customerProvince: customerAddress.provinceName,
        customerCity: customerAddress.cityName,
        customerDistrict: customerAddress.districtName,
        customerSubDistrict: customerAddress.subDistrictName,
        customerZipCode: customerAddress.zipCode,

        // Payment method snapshot
        paymentMethodId: data.paymentMethodId,
        paymentMethodName: paymentMethod.name,

        // Service snapshot (dari payload)
        service: data.service,
        serviceName: data.serviceName,
        serviceType: data.serviceType,
        isCod: data.isCod,
        isDropOff: data.isDropOff,
        schedule: data.schedule,

        shippingCost: data.shippingCost || 0,
        addCost: data.addCost || 0,
        totalAmount,
        grandTotal,
        notes: data.notes,
        status: 'PENDING',
        createdBy: userId,
        updatedBy: userId,

        // Nested create OrderItems dengan snapshot
        orderItems: {
          create: itemsWithSubtotal,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return this.formatOrderResponse(newOrder);
  }

  static async getPaginated(query: OrderQueryDTO) {
    // const skip = (page - 1) * limit;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, paymentId, service, isCod, isDropOff, startDate, endDate } = query;
    const whereClause: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (search) {
      // Search by order number, delivery number, customer name (snapshot), or customer phone (snapshot)
      whereClause.OR = [{ orderNumber: { contains: search } }, { deliveryNumber: { contains: search } }, { customerName: { contains: search } }, { customerPhone: { contains: search } }];
    }

    if (status && status.length > 0) {
      whereClause.status = { in: status };
    }

    if (paymentId && paymentId.length > 0) {
      whereClause.paymentMethodId = { in: paymentId };
    }

    if (service && service.length > 0) {
      whereClause.service = { in: service };
    }

    if (isCod !== undefined && isCod !== null) {
      whereClause.isCod = isCod;
    }

    if (isDropOff !== undefined && isDropOff !== null) {
      whereClause.isDropOff = isDropOff;
    }

    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) {
        whereClause.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.orderDate.lte = endDateTime;
      }
    }

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        include: {
          orderItems: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return {
      data: data.map((order) => this.formatOrderResponse(order)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const order = await prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  static async update(id: number, data: UpdateOrderDTO, userId: number | undefined) {
    // Validasi schedule
    if (data.isDropOff === false && !data.schedule) {
      throw new Error('Schedule wajib diisi jika bukan drop off');
    }

    // 1. Cek order exists
    const order = await prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        orderItems: true, // Include existing items
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Prepare snapshot data updates
    let customerSnapshot: any = {};
    let addressSnapshot: any = {};
    let paymentMethodSnapshot: any = {};

    // 2. Validasi customer jika diubah & ambil snapshot baru
    if (data.customerId && data.customerId !== order.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) throw new Error('Customer not found');

      customerSnapshot = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerCountryCode: customer.countryCode,
      };
    }

    // 3. Validasi customer address jika diubah & ambil snapshot baru
    if (data.customerAddressId && data.customerAddressId !== order.customerAddressId) {
      const customerAddress = await prisma.customerAddress.findFirst({
        where: {
          id: data.customerAddressId,
          customerId: data.customerId || order.customerId,
        },
      });
      if (!customerAddress) throw new Error('Customer address not found or does not belong to customer');

      addressSnapshot = {
        customerAddressFull: customerAddress.address,
        customerProvince: customerAddress.provinceName,
        customerCity: customerAddress.cityName,
        customerDistrict: customerAddress.districtName,
        customerSubDistrict: customerAddress.subDistrictName,
        customerZipCode: customerAddress.zipCode,
      };
    }

    // 4. Validasi payment method jika diubah & ambil snapshot baru
    if (data.paymentMethodId && data.paymentMethodId !== order.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { id: data.paymentMethodId, deletedAt: null, isActive: true },
      });
      if (!paymentMethod) throw new Error('Payment method not found or inactive');

      paymentMethodSnapshot = {
        paymentMethodName: paymentMethod.name,
      };
    }

    // 5. Handle service data dari payload (tidak ada validasi karena dari API eksternal)
    let serviceSnapshot: any = {};
    if (data.service !== undefined || data.serviceName !== undefined || data.serviceType !== undefined) {
      serviceSnapshot = {
        service: data.service !== undefined ? data.service : order.service,
        serviceName: data.serviceName !== undefined ? data.serviceName : order.serviceName,
        serviceType: data.serviceType !== undefined ? data.serviceType : order.serviceType,
      };
    }

    // 6. Handle Items Update (jika ada)
    let totalAmount = order.totalAmount.toNumber();
    let itemsOperations = [];

    if (data.items && data.items.length > 0) {
      // Validasi semua products & ambil snapshot
      const itemsWithSubtotal = await Promise.all(
        data.items.map(async (item) => {
          const product = await prisma.product.findFirst({
            where: { id: item.productId, deletedAt: null, isActive: true },
          });

          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found or inactive`);
          }

          const subtotal = item.quantity * item.unitPrice;

          return {
            id: item.id, // Jika ada = update, jika tidak = create
            productId: item.productId,
            productName: product.name,
            productSku: product.sku,
            productWeight: product.weight,
            productWidth: product.width,
            productHeight: product.height,
            productLength: product.length,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal,
          };
        }),
      );

      // Hitung total baru
      totalAmount = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

      // Prepare operations untuk items
      // 1. Delete items yang tidak ada di input baru
      const newItemIds = itemsWithSubtotal.filter((i) => i.id).map((i) => i.id);
      const itemsToDelete = order.orderItems.filter((existingItem) => !newItemIds.includes(existingItem.id));

      if (itemsToDelete.length > 0) {
        itemsOperations.push(
          prisma.orderItem.deleteMany({
            where: {
              id: { in: itemsToDelete.map((i) => i.id) },
            },
          }),
        );
      }

      // 2. Update atau Create items dengan snapshot
      itemsWithSubtotal.forEach((item) => {
        if (item.id) {
          // Update existing item
          itemsOperations.push(
            prisma.orderItem.update({
              where: { id: item.id },
              data: {
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                productWeight: item.productWeight,
                productWidth: item.productWidth,
                productHeight: item.productHeight,
                productLength: item.productLength,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                updatedAt: new Date(),
              },
            }),
          );
        } else {
          // Create new item dengan snapshot
          itemsOperations.push(
            prisma.orderItem.create({
              data: {
                orderId: id,
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                productWeight: item.productWeight,
                productWidth: item.productWidth,
                productHeight: item.productHeight,
                productLength: item.productLength,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              },
            }),
          );
        }
      });
    }

    // 7. Hitung grand total baru
    const shippingCost = data.shippingCost !== undefined ? data.shippingCost : order.shippingCost.toNumber();
    const addCost = data.addCost !== undefined ? data.addCost : order.addCost.toNumber();
    const grandTotal = totalAmount + shippingCost + addCost;

    // 8. Generate delivery number jika belum ada
    const deliveryNumber = order.deliveryNumber;

    // 9. Execute transaction untuk update order dan items
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          deliveryNumber,
          customerId: data.customerId,
          ...customerSnapshot,
          customerAddressId: data.customerAddressId,
          ...addressSnapshot,
          paymentMethodId: data.paymentMethodId,
          ...paymentMethodSnapshot,
          ...serviceSnapshot, // Spread service fields (service, serviceName, serviceType)
          isCod: data.isCod,
          isDropOff: data.isDropOff,
          schedule: data.schedule,
          shippingCost: shippingCost,
          addCost: addCost,
          totalAmount: data.items ? totalAmount : undefined, // Update total jika items berubah
          grandTotal: data.items || data.shippingCost !== undefined || data.addCost !== undefined ? grandTotal : undefined,
          notes: data.notes,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          orderItems: true,
        },
      }),
      ...itemsOperations,
    ]);

    return this.formatOrderResponse(updatedOrder);
  }

  static async delete(id: number, userId: number | undefined) {
    const order = await prisma.order.findFirst({
      where: { id, deletedAt: null },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Hanya bisa delete order dengan status PENDING atau CANCELLED
    if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
      throw new Error(`Cannot delete order with status ${order.status}`);
    }

    await prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Order deleted successfully' };
  }

  private static formatOrderResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      deliveryNumber: order.deliveryNumber,

      // Customer snapshot (langsung dari order, bukan relasi)
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerCountryCode: order.customerCountryCode,

      // Address snapshot
      customerAddressId: order.customerAddressId,
      customerAddressFull: order.customerAddressFull,
      customerProvince: order.customerProvince,
      customerCity: order.customerCity,
      customerDistrict: order.customerDistrict,
      customerSubDistrict: order.customerSubDistrict,
      customerZipCode: order.customerZipCode,

      // Payment method snapshot
      paymentMethodId: order.paymentMethodId,
      paymentMethodName: order.paymentMethodName,

      // Service snapshot (dari payload API eksternal)
      service: order.service,
      serviceName: order.serviceName,
      serviceType: order.serviceType,
      isCod: order.isCod,
      isDropOff: order.isDropOff,
      schedule: order.schedule,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      addCost: order.addCost.toNumber(),
      grandTotal: order.grandTotal.toNumber(),
      status: order.status,
      notes: order.notes,

      // Order items dengan snapshot product data
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productWeight: item.productWeight,
        productWidth: item.productWidth,
        productHeight: item.productHeight,
        productLength: item.productLength,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
