import { Request, Response } from 'express';
import { CustomerAddressService } from './customerAddress.service';
import { responseTemplates, statusCodes } from '../../constants';

export class CustomerAddressController {
  static async getAll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerAddressService.getAll(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All customer addresss retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerAddressService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customer address retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await CustomerAddressService.create(req.body, req.user?.id);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Customer address created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerAddressService.update(Number(id), req.body, req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customer address updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
