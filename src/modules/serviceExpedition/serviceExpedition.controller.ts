import { Request, Response } from 'express';
import { ServiceExpeditionService } from './serviceExpedition.service';
import { responseTemplates, statusCodes } from '../../constants';

export class ServiceExpeditionController {
  static async getAll(req: Request, res: Response) {
    try {
      const expeditionId = req.query.expeditionId ? Number(req.query.expeditionId) : undefined;
      const result = await ServiceExpeditionService.getAll(expeditionId);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Service expeditions retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ServiceExpeditionService.getById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = await ServiceExpeditionService.create(req.body);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Expedition created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ServiceExpeditionService.update(Number(id), req.body);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ServiceExpeditionService.changeStatus(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition status updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ServiceExpeditionService.delete(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition deleted successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
