import { Request, Response } from 'express';
import { CustomerService } from './customer.service';
import { responseTemplates, statusCodes } from '../../constants';
import { CustomerQueryDTO } from './customer.types';

export class CustomerController {
  static async getAll(_req: Request, res: Response) {
    try {
      const result = await CustomerService.getAll();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All customers retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getPaginated(req: Request, res: Response) {
    try {
      const result = await CustomerService.getPaginated(req.query as unknown as CustomerQueryDTO);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customers retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customer retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await CustomerService.create(req.body, req.user?.id);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Customer created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.update(Number(id), req.body, req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customer updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
