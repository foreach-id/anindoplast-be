import { Request, Response } from 'express';
import { StatsService } from './stats.service';
import { responseTemplates, statusCodes } from '../../constants';
import { DateRangeQueryDTO } from './stats.types';

export class StatsController {
  /**
   * Get Dashboard Statistics
   * Overview of all key metrics
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const dateRange = req.query as unknown as DateRangeQueryDTO;
      const result = await StatsService.getDashboardStats(dateRange);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Dashboard statistics retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * Get Sales Statistics
   * Revenue, orders, and sales breakdown
   */
  static async getSalesStats(req: Request, res: Response) {
    try {
      const dateRange = req.query as unknown as DateRangeQueryDTO;
      const result = await StatsService.getSalesStats(dateRange);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Sales statistics retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * Get Product Statistics
   * Product performance and inventory
   */
  static async getProductStats(_req: Request, res: Response) {
    try {
      const result = await StatsService.getProductStats();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Product statistics retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * Get Customer Statistics
   * Customer insights and top customers
   */
  static async getCustomerStats(_req: Request, res: Response) {
    try {
      const result = await StatsService.getCustomerStats();
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Customer statistics retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * Get Order Statistics
   * Order patterns and analysis
   */
  static async getOrderStats(req: Request, res: Response) {
    try {
      const dateRange = req.query as unknown as DateRangeQueryDTO;
      const result = await StatsService.getOrderStats(dateRange);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Order statistics retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }
}