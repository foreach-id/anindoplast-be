import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateExpeditionDTO, UpdateExpeditionDTO, ExpeditionQueryDTO } from './expedition.types';

export class ExpeditionService {
  static async getAllExpeditions() {
    const expeditions = await prisma.expedition.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return expeditions;
  }

  static async getExpeditionPaginated(query: ExpeditionQueryDTO) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ExpeditionWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [{ code: { contains: search } }, { name: { contains: search } }];
    }

    if (isActive) {
      const isActiveStr = String(isActive);
      whereClause.isActive = isActiveStr === 'true';
    }

    const [data, total] = await prisma.$transaction([
      prisma.expedition.findMany({
        where: whereClause,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          serviceExpeditions: {
            where: {
              deletedAt: null,
            },
          },
        },
      }),
      prisma.expedition.count({ where: whereClause }),
    ]);

    const transformedData = data.map((expedition) => ({
      ...expedition,
      services: expedition.serviceExpeditions,
      serviceExpeditions: undefined, // Remove the original field
    }));

    return {
      data: transformedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getExpeditionById(id: number) {
    const expedition = await prisma.expedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        serviceExpeditions: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!expedition) {
      throw new Error('Expedition not found');
    }

    const result = {
      ...expedition,
      services: expedition.serviceExpeditions,
      serviceExpeditions: undefined,
    };

    return result;
  }

  static async createExpedition(data: CreateExpeditionDTO) {
    const existingExpedition = await prisma.expedition.findUnique({
      where: { code: data.code },
    });

    if (existingExpedition) {
      throw new Error('Code already exists');
    }

    const newExpedition = await prisma.expedition.create({
      data: {
        code: data.code,
        name: data.name,
        isActive: true,
      },
    });

    return newExpedition;
  }

  static async updateExpedition(id: number, data: UpdateExpeditionDTO) {
    const expedition = await prisma.expedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!expedition) {
      throw new Error('Expedition not found');
    }

    if (data.code && data.code !== expedition.code) {
      const existingCode = await prisma.expedition.findUnique({
        where: { code: data.code },
      });
      if (existingCode) {
        throw new Error('Code already exists');
      }
    }

    const updatedExpedition = await prisma.expedition.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
      },
    });

    return updatedExpedition;
  }

  static async changeExpeditionStatus(id: number) {
    const expedition = await prisma.expedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!expedition) {
      throw new Error('Expedition not found');
    }

    const updatedExpedition = await prisma.expedition.update({
      where: { id },
      data: { isActive: !expedition.isActive },
    });

    return updatedExpedition;
  }

  static async deleteExpedition(id: number) {
    const expedition = await prisma.expedition.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!expedition) {
      throw new Error('Expedition not found');
    }

    await prisma.expedition.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'Expedition deleted successfully' };
  }
}
