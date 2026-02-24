import prisma from '../../config/prisma';

export class ProductCategoryService {
  static async getAll() {
    const products = await prisma.productCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return products
  }
}
