import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { responseTemplates, statusCodes } from '../../constants';
import { OrderQueryDTO } from './order.types';

export class OrderController {
  static async getAll(_req: Request, res: Response) {
    try {
      const result = await OrderService.getAll();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All orders retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getPaginated(req: Request, res: Response) {
    try {
      const result = await OrderService.getPaginated(req.query as unknown as OrderQueryDTO);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Orders retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await OrderService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Order retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await OrderService.create(req.body, req.user?.id);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Order created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await OrderService.update(Number(id), req.body, req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Order updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await OrderService.delete(Number(id), req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Order deleted successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}