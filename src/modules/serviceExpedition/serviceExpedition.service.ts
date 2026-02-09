import prisma from '../../config/prisma';
import { CreateServiceExpeditionDTO, UpdateServiceExpeditionDTO } from './serviceExpedition.types';

export class ServiceExpeditionService {
  static async getAll(expeditionId?: number) {
    const whereClause: any = {
      deletedAt: null,
    };

    if (expeditionId) {
      whereClause.expeditionId = expeditionId;
    }

    const serviceExpeditions = await prisma.serviceExpedition.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return serviceExpeditions;
  }

  static async getById(id: number) {
    const serviceExpedition = await prisma.serviceExpedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!serviceExpedition) {
      throw new Error('Service expedition not found');
    }

    return serviceExpedition;
  }

  static async create(data: CreateServiceExpeditionDTO) {
    const existingServiceExpedition = await prisma.serviceExpedition.findUnique({
      where: { code: data.code },
    });

    if (existingServiceExpedition) {
      throw new Error('Code already exists');
    }

    const newServiceExpedition = await prisma.serviceExpedition.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.desc || '',
        shippingCodPercent: data.shippingCodPercent || 0,
        shippingCostPercent: data.shippingCostPercent || 0,
        shippingHandlingCostPercent: data.shippingHandlingCostPercent || 0,
        isActive: true,
        expeditionId: data.expeditionId,
      },
    });

    return newServiceExpedition;
  }

  static async update(id: number, data: UpdateServiceExpeditionDTO) {
    const serviceExpedition = await prisma.serviceExpedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!serviceExpedition) {
      throw new Error('Service expedition not found');
    }

    if (data.code && data.code !== serviceExpedition.code) {
      const existingCode = await prisma.serviceExpedition.findUnique({
        where: { code: data.code },
      });
      if (existingCode) {
        throw new Error('Code already exists');
      }
    }

    const updatedExpedition = await prisma.serviceExpedition.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.desc,
        shippingCodPercent: data.shippingCodPercent,
        shippingCostPercent: data.shippingCostPercent,
        shippingHandlingCostPercent: data.shippingHandlingCostPercent,
        expeditionId: data.expeditionId,
      },
    });

    return updatedExpedition;
  }

  static async changeStatus(id: number) {
    const serviceExpedition = await prisma.serviceExpedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!serviceExpedition) {
      throw new Error('Service expedition not found');
    }

    const newStatus = !serviceExpedition.isActive;
    const updatedExpedition = await prisma.serviceExpedition.update({
      where: { id },
      data: { isActive: newStatus },
    });

    return updatedExpedition;
  }

  static async delete(id: number) {
    const serviceExpedition = await prisma.serviceExpedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!serviceExpedition) {
      throw new Error('Service expedition not found');
    }

    await prisma.serviceExpedition.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'Service expedition deleted successfully' };
  }
}
