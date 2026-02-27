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
        creator: { select: { name: true } },
        updater: { select: { name: true } },
        deleter: { select: { name: true } },
        category: { select: { name: true, insurance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price.toNumber(),
      description: product.description,
      isActive: product.isActive,
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      categoryId: product.categoryId,
      categoryName: product.category?.name || null,
      insurance: product.category?.insurance || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      createdBy: product.creator.name,
      updatedBy: product.updater?.name || null,
      deletedBy: product.deleter?.name || null,
    }));
  }

  static async getPaginated(query: ProductQueryDTO) {
    const { search, isActive } = query;
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
          creator: { select: { name: true } },
          updater: { select: { name: true } },
          deleter: { select: { name: true } },
          category: { select: { name: true, insurance: true } },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price.toNumber(),
      description: product.description,
      isActive: product.isActive,
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      categoryId: product.categoryId,
      categoryName: product.category?.name || null,
      insurance: product.category?.insurance || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      createdBy: product.creator.name,
      updatedBy: product.updater?.name || null,
      deletedBy: product.deleter?.name || null,
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
        creator: { select: { name: true } },
        updater: { select: { name: true } },
        deleter: { select: { name: true } },
        category: { select: { name: true, insurance: true } },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price.toNumber(),
      description: product.description,
      isActive: product.isActive,
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      categoryId: product.categoryId,
      categoryName: product.category?.name || null,
      insurance: product.category?.insurance || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      createdBy: product.creator.name,
      updatedBy: product.updater?.name || null,
      deletedBy: product.deleter?.name || null,
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
        categoryId: data.categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      sku: newProduct.sku,
      price: newProduct.price.toNumber(),
      description: newProduct.description,
      isActive: newProduct.isActive,
      weight: newProduct.weight,
      width: newProduct.width,
      height: newProduct.height,
      length: newProduct.length,
      categoryId: newProduct.categoryId,
      categoryName: newProduct.category?.name || null,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
      deletedAt: newProduct.deletedAt,
      createdBy: newProduct.creator.name,
      updatedBy: newProduct.updater?.name || null,
      deletedBy: null,
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
        categoryId: data.categoryId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
        deleter: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      price: updatedProduct.price.toNumber(),
      description: updatedProduct.description,
      isActive: updatedProduct.isActive,
      weight: updatedProduct.weight,
      width: updatedProduct.width,
      height: updatedProduct.height,
      length: updatedProduct.length,
      categoryId: updatedProduct.categoryId,
      categoryName: updatedProduct.category?.name || null,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
      deletedAt: updatedProduct.deletedAt,
      createdBy: updatedProduct.creator.name,
      updatedBy: updatedProduct.updater?.name || null,
      deletedBy: updatedProduct.deleter?.name || null,
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
