import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO, ProductQueryDTO } from './product.types';

export class ProductService {
  static async getAll() {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
    }));
  }

  static async getPaginated(query: ProductQueryDTO) {
    const {search, isActive } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const whereClause: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
    }

    if (isActive) {
      const isActiveStr = String(isActive);
      whereClause.isActive = isActiveStr === 'true';
    }

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const transformedProducts = data.map((product) => ({
      ...product,
      price: product.price.toNumber(),
    }));

    return {
      data: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: { select: { id: true, name: true } },
        updater: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  static async create(data: CreateProductDTO, userId: number | undefined) {
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new Error('SKU already exists');
    }

    if (typeof userId !== 'number') {
      throw new Error('User ID is required for creating Product');
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true,
        weight: data.weight,
        width: data.width,
        height: data.height,
        length: data.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return {
      ...newProduct,
      price: newProduct.price.toNumber(),
    };
  }

  static async update(id: number, data: UpdateProductDTO, userId: number | undefined) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check SKU uniqueness if updating SKU
    if (data.sku && data.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw new Error('SKU already exists');
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        description: data.description,
        isActive: data.isActive,
        weight: data.weight,
        width: data.width,
        height: data.height,
        length: data.length,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return {
      ...updatedProduct,
      price: updatedProduct.price.toNumber(),
    };
  }

  static async delete(id: number, userId: number | undefined) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
        isActive: false,
      },
    });

    return { message: 'Product deleted successfully' };
  }
}