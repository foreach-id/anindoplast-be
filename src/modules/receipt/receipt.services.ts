import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/prisma';
import { ReceiptData } from './receipt.types';

export class ReceiptService {
  static async getOrderData(deliveryNumbers: string[]): Promise<ReceiptData[]> {
    const orders = await prisma.order.findMany({
      where: { deliveryNumber: { in: deliveryNumbers } },
      include: {
        orderItems: true,
      },
    });

    if (!orders || orders.length === 0) {
      return [];
    }

    return orders.map((order) => {
      const totalWeight = order.orderItems.reduce((sum: number, item: any) => {
        const productWeight = item.productWeight || 0;
        return sum + productWeight * item.quantity;
      }, 0);

      return {
        deliveryNumber: order.deliveryNumber || '',
        orderNumber: order.orderNumber || '',
        codAmount: Number(order.grandTotal),
        recipient: {
          name: order.customerName || '',
          phone: `${order.customerCountryCode || ''}${order.customerPhone || ''}`,
          address: order.customerAddressFull || '',
          district: order.customerDistrict || '',
          city: order.customerCity || '',
          province: order.customerProvince || '',
        },
        sender: {
          name: 'Ferawani Store',
          phone: '+6285271372389',
          district: 'CIBEUNYING KALER',
        },
        items: order.orderItems.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
        })),
        weight: totalWeight / 1000,
        orderDate: order.orderDate,
        notes: order.notes || '',
        serviceExpeditionCode: order.service || 'SDS222606209',
        serviceExpeditionName: order.serviceName || '[EZ] - JNT-COD',
      };
    });
  }

  static async generatePDF(dataArray: ReceiptData[]): Promise<Buffer[]> {
    try {
      const { renderToBuffer } = await import('@react-pdf/renderer');
      const { createReceiptDocument } = await import('./ReceiptDocument');
      const buffers: Buffer[] = [];
      for (const data of dataArray) {
        const barcodeDataUrl = await this.generateBarcodeDataUrl(data.deliveryNumber);
        const qrCodeDataUrl = await QRCode.toDataURL(data.deliveryNumber, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        const logoUrl = this.getLogoBase64('logo-anindo.png');
        const logoJntUrl = this.getLogoBase64('logo-jnt.png');
        const doc = createReceiptDocument({
          data,
          qrCodeDataUrl,
          barcodeDataUrl,
          logoUrl,
          logoJntUrl,
        });
        const pdfBuffer = await renderToBuffer(doc);
        buffers.push(pdfBuffer);
      }
      return buffers;
    } catch (error) {
      console.error('Error generating PDFs:', error);
      throw new Error('Failed to generate PDFs');
    }
  }

  private static async generateBarcodeDataUrl(code: string): Promise<string> {
    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128', // Barcode type
        text: code, // Text to encode
        scale: 3, // 3x scaling factor
        height: 15, // Bar height in millimeters
        includetext: false, // Don't show text below barcode
        backgroundcolor: 'ffffff',
      });

      return `data:image/png;base64,${png.toString('base64')}`;
    } catch (err) {
      console.error('Barcode generation error:', err);
      return '';
    }
  }

  private static getLogoBase64(filename: string): string {
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', filename);

      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(filename).toLowerCase();

        let mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') {
          mimeType = 'image/jpeg';
        } else if (ext === '.svg') {
          mimeType = 'image/svg+xml';
        }

        return `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
      }

      console.warn(`Logo file not found: ${logoPath}`);
      return '';
    } catch (error) {
      console.error(`Error loading logo ${filename}:`, error);
      return '';
    }
  }
}
