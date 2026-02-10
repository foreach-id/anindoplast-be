import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreatePaymentMethodDTO, UpdatePaymentMethodDTO, PaymentMethodQueryDTO } from './paymentMethod.types';

export class PaymentMethodService {
  static async getAll() {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return paymentMethods;
  }

  static async getPaginated(query: PaymentMethodQueryDTO) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PaymentMethodWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [{ name: { contains: search } }];
    }

    if (isActive) {
      const isActiveStr = String(isActive);
      whereClause.isActive = isActiveStr === 'true';
    }

    const [data, total] = await prisma.$transaction([
      prisma.paymentMethod.findMany({
        where: whereClause,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.paymentMethod.count({ where: whereClause }),
    ]);

    return {
      data: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!paymentMethod) {
      throw new Error('PaymentMethod not found');
    }

    return paymentMethod;
  }

  static async create(data: CreatePaymentMethodDTO, userId: number | undefined) {
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { name: data.name },
    });

    if (existingPaymentMethod) {
      throw new Error('Name already exists');
    }

    if (typeof userId !== 'number') {
      throw new Error('User ID is required for creating PaymentMethod');
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        name: data.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return newPaymentMethod;
  }

  static async update(id: number, data: UpdatePaymentMethodDTO, userId: number | undefined) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!paymentMethod) {
      throw new Error('PaymentMethod not found');
    }

    if (data.name && data.name !== paymentMethod.name) {
      const existingName = await prisma.paymentMethod.findFirst({
        where: { name: data.name },
      });
      if (existingName) {
        throw new Error('Name already exists');
      }
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: data.name,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return updatedPaymentMethod;
  }

  static async changeStatus(id: number) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!paymentMethod) {
      throw new Error('PaymentMethod not found');
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !paymentMethod.isActive },
    });

    return updatedPaymentMethod;
  }

  static async delete(id: number) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!paymentMethod) {
      throw new Error('PaymentMethod not found');
    }

    await prisma.paymentMethod.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'PaymentMethod deleted successfully' };
  }
}
