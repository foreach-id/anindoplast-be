import { Request, Response } from 'express';
import { PaymentMethodService } from './paymentMethod.service';
import { responseTemplates, statusCodes } from '../../constants';
import { PaymentMethodQueryDTO } from './paymentMethod.types';

export class PaymentMethodController {
  static async getAll(_req: Request, res: Response) {
    try {
      const result = await PaymentMethodService.getAll();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All payment methods retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getPaginated(req: Request, res: Response) {
    try {
      const result = await PaymentMethodService.getPaginated(req.query as unknown as PaymentMethodQueryDTO);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Payment methods retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PaymentMethodService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Payment method retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await PaymentMethodService.create(req.body, req.user?.id);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Payment method created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PaymentMethodService.update(Number(id), req.body, req.user?.id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Payment method updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PaymentMethodService.changeStatus(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Payment method status updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PaymentMethodService.delete(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Payment method deleted successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
