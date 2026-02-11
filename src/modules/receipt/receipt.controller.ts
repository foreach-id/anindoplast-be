import { Request, Response } from 'express';
import { ReceiptService } from './receipt.services';
import { PDFDocument } from 'pdf-lib';

type PdfResult = { deliveryNumber: string; buffer: Buffer };

export class ReceiptController {
  static async generateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { deliveryNumber } = req.body;

      if (!deliveryNumber || !Array.isArray(deliveryNumber) || deliveryNumber.length === 0) {
        res.status(400).json({
          success: false,
          message: 'deliveryNumber array is required',
        });
        return;
      }

      const pdfResults = await Promise.allSettled(
        deliveryNumber.map(async (dn) => {
          const orderData = await ReceiptService.getOrderData([dn]);
          if (!orderData || orderData.length === 0) {
            throw new Error(`Order not found: ${dn}`);
          }
          const pdfBuffers = await ReceiptService.generatePDF(orderData);
          return {
            deliveryNumber: dn,
            buffer: pdfBuffers[0],
          };
        }),
      );

      const validPdfs = pdfResults.filter((result): result is PromiseFulfilledResult<PdfResult> => result.status === 'fulfilled').map((result) => result.value);

      pdfResults
        .filter((result) => result.status === 'rejected')
        .forEach((result) => {
          const error = (result as PromiseRejectedResult).reason;
          console.error('Failed to generate PDF:', error.message);
        });

      if (validPdfs.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No valid orders found',
        });
        return;
      }

      if (validPdfs.length === 1) {
        const pdf = validPdfs[0];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}-resi.pdf`);
        res.setHeader('Content-Length', pdf.buffer.length);
        res.send(pdf.buffer);
        return;
      }

      // Multiple PDFs - merge into one
      const mergedPdfBytes = await ReceiptController.mergePDFs(validPdfs.map((pdf) => pdf.buffer));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}-resi.pdf`);
      res.setHeader('Content-Length', mergedPdfBytes.length);
      res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
      console.error('Error generating receipts:', error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate receipts',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private static async mergePDFs(pdfBuffers: Buffer[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < pdfBuffers.length; i++) {
      try {
        const pdf = await PDFDocument.load(pdfBuffers[i]);

        // Copy all pages from this PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        // Add each page to the merged PDF
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      } catch (error) {
        console.error(`Error merging PDF ${i + 1}:`, error);
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
  }
}
