import { Request, Response } from 'express';
import { ProductCategoryService } from './productCategory.service';
import { responseTemplates, statusCodes } from '../../constants';

export class ProductCategoryController {
  static async getAll(_req: Request, res: Response) {
    try {
      const result = await ProductCategoryService.getAll();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All product categories retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }
}
