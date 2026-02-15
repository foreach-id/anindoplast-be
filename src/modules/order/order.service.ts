// src/modules/order/order.service.ts
import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateOrderDTO, UpdateOrderDTO, OrderQueryDTO } from './order.types';

export class OrderService {
  // Helper function untuk generate delivery number
  private static generateDeliveryNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `JX${timestamp}${random}`;
  }

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

    // 4. Validasi service expedition (jika ada)
    if (data.serviceExpeditionId) {
      const serviceExpedition = await prisma.serviceExpedition.findFirst({
        where: { id: data.serviceExpeditionId, deletedAt: null, isActive: true },
      });
      if (!serviceExpedition) throw new Error('Service expedition not found or inactive');
    }

    // 5. Validasi products dan hitung total
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
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal,
        };
      }),
    );

    // 6. Hitung grand total
    const grandTotal = totalAmount + (data.shippingCost || 0);

    // 7. Generate Order Number dan Delivery Number
    const orderNumber = `AMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const deliveryNumber = this.generateDeliveryNumber();

    // 8. Create Order + OrderItems dalam 1 transaksi
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        deliveryNumber,
        customerId: data.customerId,
        customerAddressId: data.customerAddressId,
        paymentMethodId: data.paymentMethodId,
        serviceExpeditionId: data.serviceExpeditionId,
        shippingCost: data.shippingCost || 0,
        totalAmount,
        grandTotal,
        notes: data.notes,
        status: 'PENDING',
        createdBy: userId,
        updatedBy: userId,

        // Nested create OrderItems
        orderItems: {
          create: itemsWithSubtotal,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        customer: true,
        customerAddress: true,
        paymentMethod: true,
        serviceExpedition: {
          include: {
            expedition: true,
          }
        },
      },
    });

    return this.formatOrderResponse(newOrder);
  }

  static async getAll() {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        customerAddress: true,
        paymentMethod: true,
        serviceExpedition: {
          include: {
            expedition: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.formatOrderResponse(order));
  }

  static async getPaginated(query: OrderQueryDTO) {
    // const skip = (page - 1) * limit;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, customerId } = query;
    const whereClause: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [{ orderNumber: { contains: search } }, { customer: { name: { contains: search } } }, { customer: { phone: { contains: search } } }];
    }

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        include: {
          customer: true,
          customerAddress: true,
          paymentMethod: true,
          serviceExpedition: {
            include: {
              expedition: true,
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
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
        customer: true,
        customerAddress: true,
        paymentMethod: true,
        serviceExpedition: {
          include:{
            expedition: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return this.formatOrderResponse(order);
  }


  static async update(id: number, data: UpdateOrderDTO, userId: number | undefined) {
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

    // 2. Validasi customer jika diubah
    if (data.customerId && data.customerId !== order.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) throw new Error('Customer not found');
    }

    // 3. Validasi customer address jika diubah
    if (data.customerAddressId && data.customerAddressId !== order.customerAddressId) {
      const customerAddress = await prisma.customerAddress.findFirst({
        where: {
          id: data.customerAddressId,
          customerId: data.customerId || order.customerId,
        },
      });
      if (!customerAddress) throw new Error('Customer address not found or does not belong to customer');
    }

    // 4. Validasi payment method jika diubah
    if (data.paymentMethodId && data.paymentMethodId !== order.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { id: data.paymentMethodId, deletedAt: null, isActive: true },
      });
      if (!paymentMethod) throw new Error('Payment method not found or inactive');
    }

    // 5. Validasi service expedition jika diubah
    if (data.serviceExpeditionId) {
      const serviceExpedition = await prisma.serviceExpedition.findFirst({
        where: { id: data.serviceExpeditionId, deletedAt: null, isActive: true },
      });
      if (!serviceExpedition) throw new Error('Service expedition not found or inactive');
    }

    // 6. Handle Items Update (jika ada)
    let totalAmount = order.totalAmount.toNumber();
    let itemsOperations = [];

    if (data.items && data.items.length > 0) {
      // Validasi semua products
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
      const newItemIds = itemsWithSubtotal.filter(i => i.id).map(i => i.id);
      const itemsToDelete = order.orderItems.filter(
        (existingItem) => !newItemIds.includes(existingItem.id)
      );

      if (itemsToDelete.length > 0) {
        itemsOperations.push(
          prisma.orderItem.deleteMany({
            where: {
              id: { in: itemsToDelete.map(i => i.id) },
            },
          })
        );
      }

      // 2. Update atau Create items
      itemsWithSubtotal.forEach((item) => {
        if (item.id) {
          // Update existing item
          itemsOperations.push(
            prisma.orderItem.update({
              where: { id: item.id },
              data: {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                updatedAt: new Date(),
              },
            })
          );
        } else {
          // Create new item
          itemsOperations.push(
            prisma.orderItem.create({
              data: {
                orderId: id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              },
            })
          );
        }
      });
    }

    // 7. Hitung grand total baru
    const shippingCost = data.shippingCost !== undefined ? data.shippingCost : order.shippingCost.toNumber();
    const grandTotal = totalAmount + shippingCost;

    // 8. Generate delivery number jika belum ada
    const deliveryNumber = order.deliveryNumber || this.generateDeliveryNumber();

    // 9. Execute transaction untuk update order dan items
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          deliveryNumber,
          customerId: data.customerId,
          customerAddressId: data.customerAddressId,
          paymentMethodId: data.paymentMethodId,
          serviceExpeditionId: data.serviceExpeditionId,
          shippingCost: shippingCost,
          totalAmount: data.items ? totalAmount : undefined, // Update total jika items berubah
          grandTotal: data.items || data.shippingCost !== undefined ? grandTotal : undefined,
          status: data.status,
          notes: data.notes,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          customerAddress: true,
          paymentMethod: true,
          serviceExpedition: {
            include: {
              expedition: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
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
      customerId: order.customerId,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerAddress: order.customerAddress.address,
      paymentMethodId: order.paymentMethodId,
      paymentMethodName: order.paymentMethod.name,
      serviceExpeditionId: order.serviceExpeditionId,
      serviceExpeditionName: order.serviceExpedition?.name,
      expeditionId: order.serviceExpedition?.expeditionId, 
      expeditionName: order.serviceExpedition?.expedition?.name, 
      expeditionCode: order.serviceExpedition?.expedition?.code,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      grandTotal: order.grandTotal.toNumber(),
      status: order.status,
      notes: order.notes,
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
