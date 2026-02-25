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
   * GET /api/shipping/location/provinces
   */
  static async getProvinces(_req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.getProvinces();
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Provinces retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/location/cities?provinceId=xxx
   */
  static async getCities(req: Request, res: Response) {
    try {
      const { provinceId } = req.query as { provinceId: string };
      const result = await KiriminAjaService.getCities(parseInt(provinceId, 10));
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Cities retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/location/districts?cityId=xxx
   */
  static async getDistricts(req: Request, res: Response) {
    try {
      const { cityId } = req.query as { cityId: string };
      const result = await KiriminAjaService.getDistrict(parseInt(cityId, 10));
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Districts retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/location/subdistricts?districtId=xxx
   */
  static async getSubdistrict(req: Request, res: Response) {
    try {
      const { districtId } = req.query as { districtId: string };
      const result = await KiriminAjaService.getSubdistrict(parseInt(districtId, 10));
      return res.status(statusCodes.OK).json(responseTemplates.success(result.results, 'Subdistricts retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/location/address?search=xxx
   */
  static async searchAddress(req: Request, res: Response) {
    try {
      const { search } = req.query as { search: string };
      const result = await KiriminAjaService.searchAddress(search);
      return res.status(statusCodes.OK).json(responseTemplates.success(result.data, 'Address results retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/shipping-price
   */
  static async getShippingPrice(req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.getShippingPrice(req.body);
      return res.status(statusCodes.OK).json(responseTemplates.success(result.results, 'Shipping price retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/cancel/awb
   * Batalkan paket ke KiriminAja berdasarkan nomor AWB
   * Body: { awb, reason }
   * Catatan: hanya berlaku untuk paket yang belum dijemput kurir
   */
  static async cancelByAwb(req: Request, res: Response) {
    try {
      const { awb, reason } = req.body;
      const result = await KiriminAjaService.cancelByAwb(awb, reason);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Shipment cancelled successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/pickup-schedule
   * Ambil jadwal pickup yang tersedia dari KiriminAja
   */
  static async getPickupSchedule(_req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.getPickupSchedule();
      return res.status(statusCodes.OK).json(responseTemplates.success(result.schedules, 'Pickup schedules retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/couriers
   * Daftar kurir aktif di KiriminAja
   */
  static async getCouriers(_req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.getCouriers();
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Courier list retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/courier-groups
   * Daftar grup layanan kurir (Regular, One Day, Next Day, Ekonomi, dll)
   */
  static async getCourierGroups(_req: Request, res: Response) {
    try {
      const result = await KiriminAjaService.getCourierGroups();
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Courier groups retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * GET /api/shipping/courier-detail?code=jne
   * Detail layanan per kurir (kode service, nama layanan)
   */
  static async getCourierDetail(req: Request, res: Response) {
    try {
      const { code } = req.query as { code: string };
      const result = await KiriminAjaService.getCourierDetail(code);
      return res.status(statusCodes.OK).json(responseTemplates.success(result.datas, 'Courier detail retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/courier-preference
   * Set whitelist kurir. Body: { services: ["jne","jnt"] } atau {} untuk reset.
   */
  static async setCourierPreference(req: Request, res: Response) {
    try {
      const services = req.body?.services ?? null;
      const result = await KiriminAjaService.setCourierPreference(services);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Courier preference updated successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }

  /**
   * POST /api/shipping/track/express
   * Tracking Order Express by Order ID atau AWB
   * Body: { order_id: "OID-xxx" | "AWB-xxx" }
   */
  static async trackOrderExpress(req: Request, res: Response) {
    try {
      const { order_id } = req.body;
      const result = await KiriminAjaService.trackOrderExpress(order_id);
      return res.status(statusCodes.OK).json(responseTemplates.success(result, 'Tracking retrieved successfully'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return res.status(statusCodes.BAD_REQUEST).json(responseTemplates.error(message));
    }
  }
}
