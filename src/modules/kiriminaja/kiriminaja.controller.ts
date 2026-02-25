import { Request, Response } from 'express';
import { KiriminAjaService } from './kiriminaja.service';
import { responseTemplates, statusCodes } from '../../constants';

export class KiriminAjaController {
  /**
   * POST /api/shipping/check-rate
   * Cek ongkir sebelum admin memilih kurir & buat shipment
   */
  static async checkRate(req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.checkRate(req.body);
      return res.status(statusCodes.OK).json(responseTemplates.success(result.data, 'Pricing retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/process/:id
   * Proses order ke KiriminAja hanya dengan order ID — semua data diambil otomatis dari order
   */
  static async processOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await KiriminAjaService.createShipmentExpress({
        orderId: Number(id),
        schedule: req.body?.schedule,
      });
      return res.status(statusCodes.CREATED).json(responseTemplates.success(result, 'Shipment created successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/track/awb/:awb
   * Tracking paket berdasarkan nomor AWB / resi
   */
  static async trackByAwb(req: Request, res: Response) {
    try {
      const { awb } = req.params;
      const result = await KiriminAjaService.trackOrder(awb as string);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Tracking retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/track/order/:id
   * Tracking paket berdasarkan order ID internal
   */
  static async trackByOrderId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await KiriminAjaService.trackByOrderId(Number(id));
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Tracking retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.NOT_FOUND).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/cancel/:id
   * Batalkan shipment ke KiriminAja berdasarkan order ID internal
   */
  static async cancelShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await KiriminAjaService.cancelShipment(Number(id), req.body?.reason);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Shipment cancelled successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/district/search?keyword=xxx
   * Cari kecamatan / kelurahan KiriminAja untuk dropdown di FE
   */
  static async searchDistrict(req: Request, res: Response) {
    try {
      const { keyword } = req.query as { keyword: string };
      const result = await KiriminAjaService.searchDistrict(keyword);
      return res.status(statusCodes.OK).json(responseTemplates.success(result.data, 'Districts retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }
}
