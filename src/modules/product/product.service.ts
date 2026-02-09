import prisma from '../../config/prisma';
import { CreateProductInput, ProductQueryInput, UpdateProductInput } from './product.schema';
import { Prisma } from '@prisma/client';

export const createProduct = async (data: CreateProductInput, userId: number) => {
  const product = await prisma.product.create({
    data: {
      ...data,
      createdBy: userId,
    },
  });

  return {
    ...product,
    price: product.price.toNumber()
  };
};

export const getProducts = async (query: ProductQueryInput) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { search, isActive } = query;

  const whereClause: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(isActive && { isActive: isActive === 'true' }),
    ...(search && {
      OR: [
        { name: { contains: search } }, 
        { sku: { contains: search } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip, 
      take: limit, 
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } }, 
      },
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const transformedProducts = products.map(product => ({
    ...product,
    price: product.price.toNumber()
  }));

  return {
    data: transformedProducts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
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
    price: product.price.toNumber()
  };
};

export const updateProduct = async (id: number, data: UpdateProductInput, userId: number) => {
  await getProductById(id); 

  // FIX: Simpan hasil update ke variable 'product'
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
    },
  });

  return {
    ...product,
    price: product.price.toNumber()
  };
};

export const deleteProduct = async (id: number, userId: number) => {
  await getProductById(id); 

  return prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
      isActive: false, 
    },
  });
};