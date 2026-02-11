import React from 'react';
import { ReceiptTemplate } from './ReceiptTemplate';
import { ReceiptData } from './receipt.types';

interface ReceiptDocumentProps {
  data: ReceiptData;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
  logoUrl?: string;
  logoJntUrl?: string;
}

export const createReceiptDocument = (data: ReceiptDocumentProps) => {
  return <ReceiptTemplate data={data.data} qrCodeDataUrl={data.qrCodeDataUrl} barcodeDataUrl={data.barcodeDataUrl} logoUrl={data.logoUrl} logoJntUrl={data.logoJntUrl} />;
};
