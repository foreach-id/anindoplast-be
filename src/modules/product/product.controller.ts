import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { responseTemplates, statusCodes } from '../../constants';
import { ProductQueryDTO } from './product.types';

export class ProductController {
  static async getAll(_req: Request, res: Response) {
    try {
      const result = await ProductService.getAll();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All products retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getPaginated(req: Request, res: Response) {
    try {
      const result = await ProductService.getPaginated(req.query as unknown as ProductQueryDTO);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Products retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Product retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await ProductService.create(req.body, req.user?.id);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Product created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.update(Number(id), req.body, req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Product updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.delete(Number(id), req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Product deleted successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}