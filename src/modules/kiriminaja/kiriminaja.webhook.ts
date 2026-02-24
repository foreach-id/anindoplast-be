import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { Logger } from '@utils/index';
import { OrderStatus } from '@prisma/client';

/**
 * Mapping status_code dari KiriminAja webhook ke OrderStatus enum kamu
 *
 * Referensi: https://developer.kiriminaja.com/docs/important-notes/status-mapping
 *
 * Histories status_code dari real response tracking:
 *   100 = On Process / With delivery courier (masih dalam perjalanan)
 *   200 = Delivered (sudah sampai)
 *
 * Webhook status_code (bisa berbeda dengan tracking histories):
 *   100 = Order diterima & diproses
 *   200 = Paket dalam pengiriman (SHIPPED)
 *   300 = Terkirim (DELIVERED)
 *   400 = Gagal kirim / return
 *   500 = Dibatalkan
 */
const WEBHOOK_STATUS_MAP: Record<number, OrderStatus> = {
  // Order diproses
  100: OrderStatus.PROCESSING,
  // Dalam pengiriman
  200: OrderStatus.SHIPPED,
  // Terkirim
  300: OrderStatus.DELIVERED,
  // Gagal kirim / return / cancel
  400: OrderStatus.CANCELLED,
  500: OrderStatus.CANCELLED,
};

/**
 * Payload real dari KiriminAja Webhook (Express):
 * {
 *   "awb": "JX1234567890",
 *   "order_id": "AMP17403291234",
 *   "kj_order_id": "AMP17403291234",
 *   "status_code": 200,
 *   "status": "Paket sedang dalam perjalanan menuju tujuan",
 *   "location": "Jakarta Selatan",
 *   "created_at": "2026-02-21 14:30:00",
 *   "service": "jnt",
 *   "service_type": "REG"
 * }
 */
export class KiriminAjaWebhookController {

  /**
   * POST /api/shipping/webhook
   *
   * Endpoint ini didaftarkan ke KiriminAja di menu:
   * Dashboard → Integrasi → Webhook / Callback URL
   *
   * PENTING: Tidak ada auth JWT di sini karena yang hit adalah server KiriminAja.
   * Proteksi via IP whitelist di level server/nginx atau validasi signature header.
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;

      Logger.info('[KiriminAja Webhook] Payload diterima', payload);

      const {
        awb,
        order_id,   // ini adalah order_number internal kamu
        status_code,
      } = payload;

      // Validasi minimal ada salah satu identifier
      if (!awb && !order_id) {
        Logger.warn('[KiriminAja Webhook] Payload tidak valid - tidak ada awb/order_id');
        // Tetap return 200 agar KiriminAja tidak terus retry
        return res.status(200).json({ success: false, message: 'Missing awb or order_id' });
      }

      // Cari order di DB berdasarkan AWB atau orderNumber
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(awb ? [{ deliveryNumber: String(awb) }] : []),
            ...(order_id ? [{ orderNumber: String(order_id) }] : []),
          ],
          deletedAt: null,
        },
        select: {
          id: true,
          orderNumber: true,
          deliveryNumber: true,
          status: true,
        },
      });

      if (!order) {
        Logger.warn('[KiriminAja Webhook] Order tidak ditemukan di DB', { awb, order_id });
        // Return 200 agar tidak di-retry terus
        return res.status(200).json({ success: true, message: 'Order not found, ignored' });
      }

      // Jangan update jika order sudah DELIVERED (status final)
      if (order.status === 'DELIVERED') {
        Logger.info('[KiriminAja Webhook] Order sudah DELIVERED, skip update', {
          orderNumber: order.orderNumber,
        });
        return res.status(200).json({ success: true, message: 'Already delivered, skipped' });
      }

      // Map status code ke OrderStatus
      const newStatus: OrderStatus | undefined = WEBHOOK_STATUS_MAP[Number(status_code)];

      if (!newStatus) {
        Logger.warn('[KiriminAja Webhook] status_code tidak dikenali', { status_code });
        return res.status(200).json({ success: true, message: 'Unknown status_code, ignored' });
      }

      // Update hanya jika status berubah
      if (newStatus !== order.status) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: newStatus,
            // Simpan AWB jika belum ada (kasus AWB null saat order dibuat)
            ...(awb && !order.deliveryNumber ? { deliveryNumber: String(awb) } : {}),
          },
        });

        Logger.info('[KiriminAja Webhook] Status order diupdate', {
          orderNumber: order.orderNumber,
          awb,
          statusLama: order.status,
          statusBaru: newStatus,
          statusCodeKiriminAja: status_code,
        });
      } else {
        Logger.info('[KiriminAja Webhook] Status tidak berubah, skip', {
          orderNumber: order.orderNumber,
          status: order.status,
        });
      }

      // Selalu return 200 ke KiriminAja
      return res.status(200).json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
      Logger.error('[KiriminAja Webhook] Error tidak terduga', error);
      // Tetap 200 agar tidak di-retry, tapi log errornya
      return res.status(200).json({ success: false, message: 'Internal error, has been logged' });
    }
  }
}