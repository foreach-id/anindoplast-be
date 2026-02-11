import { Request, Response } from 'express';
import { ReceiptService } from './receipt.services';

export class ReceiptController {
  static async generateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { deliveryNumber } = req.body;

      const orderData = await ReceiptService.getOrderData(deliveryNumber);

      if (!orderData) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      // Generate PDF
      const pdfBuffer = await ReceiptService.generatePDF(orderData);

      // Set headers untuk download PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=resi-${deliveryNumber}.pdf`);

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
