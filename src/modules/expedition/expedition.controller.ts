import { Request, Response } from 'express';
import { ExpeditionService } from './expedition.service';
import { responseTemplates, statusCodes } from '../../constants';
import { ExpeditionQueryDTO } from './expedition.types';

export class ExpeditionController {
  static async getAllExpeditions(_req: Request, res: Response) {
    try {
      const result = await ExpeditionService.getAllExpeditions();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'All expeditions retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getExpeditionPaginated(req: Request, res: Response) {
    try {
      const result = await ExpeditionService.getExpeditionPaginated(req.query as unknown as ExpeditionQueryDTO);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expeditions retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  static async getExpeditionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ExpeditionService.getExpeditionById(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  static async createExpedition(req: Request, res: Response) {
    try {
      const result = await ExpeditionService.createExpedition(req.body);
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Expedition created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async updateExpedition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ExpeditionService.updateExpedition(Number(id), req.body);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async changeExpeditionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ExpeditionService.changeExpeditionStatus(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition status updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  static async deleteExpedition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ExpeditionService.deleteExpedition(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Expedition deleted successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
