import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReceiptData } from './receipt.types';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 6,
    fontFamily: 'Helvetica',
  },

  // Header dengan logo
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottom: '1px solid #000',
  },
  logoLeft: {
    width: 35,
    height: 14,
  },
  headerCode: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 1,
  },
  logoRight: {
    width: 35,
    height: 14,
  },

  // Barcode section
  barcodeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottom: '1px solid #000',
  },
  barcode: {
    width: 150,
    height: 30,
    marginBottom: 2,
  },
  deliveryNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Service info row
  serviceRow: {
    flexDirection: 'row',
    borderBottom: '2px solid #000',
  },
  serviceCol: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid #000',
  },
  serviceColLast: {
    flex: 1,
    padding: 5,
  },
  serviceText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },

  // Recipient/Sender row
  recipientSenderRow: {
    flexDirection: 'row',
    borderBottom: '2px solid #000',
  },
  recipientSenderCol: {
    flex: 1,
    padding: 5,
    paddingVertical: 8,
    borderRight: '1px solid #000',
  },
  recipientSenderColLast: {
    flex: 1,
    padding: 5,
    paddingVertical: 8,
  },
  label: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  phoneText: {
    fontSize: 6,
    marginBottom: 3,
  },
  districtText: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },

  // Address row
  addressRow: {
    padding: 5,
    paddingVertical: 8,
    borderBottom: '2px solid #000',
  },
  addressText: {
    fontSize: 6,
    lineHeight: 1.3,
    textTransform: 'uppercase',
  },

  // COD and QR row
  codQrRow: {
    flexDirection: 'row',
    borderBottom: '2px solid #000',
  },
  codCol: {
    flex: 1,
    borderRight: '1px solid #000',
  },
  codAmountWrapper: {
    flex: 1,
    padding: 5,
    paddingVertical: 4,
    borderBottom: '2px solid #000',
    justifyContent: 'center',
  },
  codAmount: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  codWeightWrapper: {
    padding: 5,
    paddingVertical: 4,
  },
  codWeight: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  qrCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  qrCode: {
    width: 60,
    height: 60,
  },

  // Notes and Items row
  notesItemsRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    borderBottom: '2px solid #000',
  },
  notesCol: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid #000',
  },
  itemsCol: {
    flex: 1,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 6,
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerDate: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
});

interface ReceiptTemplateProps {
  data: ReceiptData;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
  logoUrl?: string;
  logoJntUrl?: string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ data, qrCodeDataUrl, barcodeDataUrl, logoUrl, logoJntUrl }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        {/* Header dengan Logo */}
        <View style={styles.headerRow}>
          {logoUrl ? <Image src={logoUrl} style={styles.logoLeft} /> : <View style={{ width: 35 }} />}
          <Text style={styles.headerCode}>MLG-SUB</Text>
          {logoJntUrl ? <Image src={logoJntUrl} style={styles.logoRight} /> : <View style={{ width: 35 }} />}
        </View>

        {/* Barcode Section */}
        <View style={styles.barcodeContainer}>
          {barcodeDataUrl ? <Image src={barcodeDataUrl} style={styles.barcode} /> : <View style={styles.barcode} />}
          <Text style={styles.deliveryNumber}>{data.deliveryNumber}</Text>
        </View>

        {/* Service Code and Name */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceCol}>
            <Text style={styles.serviceText}>{data.orderNumber || 'SDS222606209'}</Text>
          </View>
          <View style={styles.serviceColLast}>
            <Text style={styles.serviceText}>{data.serviceExpeditionName || '[EZ] - JNT-COD'}</Text>
          </View>
        </View>

        {/* Recipient and Sender */}
        <View style={styles.recipientSenderRow}>
          <View style={styles.recipientSenderCol}>
            <Text style={styles.label}>Penerima : {data.recipient.name}</Text>
            <Text style={styles.phoneText}>Telp: {data.recipient.phone}</Text>
            <Text style={styles.districtText}>{data.recipient.district}</Text>
          </View>
          <View style={styles.recipientSenderColLast}>
            <Text style={styles.label}>Pengirim : {data.sender.name}</Text>
            <Text style={styles.phoneText}>Telp: {data.sender.phone}</Text>
            <Text style={styles.districtText}>{data.sender.district}</Text>
          </View>
        </View>

        {/* Full Address */}
        <View style={styles.addressRow}>
          <Text style={styles.addressText}>{data.recipient.address}</Text>
        </View>

        {/* COD Amount and QR Code */}
        <View style={styles.codQrRow}>
          <View style={styles.codCol}>
            <View style={styles.codAmountWrapper}>
              <Text style={styles.codAmount}>Rp. {data.codAmount.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.codWeightWrapper}>
              <Text style={styles.codWeight}>BERAT : {data.weight} KG</Text>
            </View>
          </View>
          <View style={styles.qrCol}>{qrCodeDataUrl ? <Image src={qrCodeDataUrl} style={styles.qrCode} /> : <View style={styles.qrCode} />}</View>
        </View>

        {/* Notes and Items List */}
        <View style={styles.notesItemsRow}>
          <View style={styles.notesCol}>
            <Text style={styles.sectionTitle}>Catatan : {data.notes || 'dihubungi dahulu sebelum\npaket direturn.'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Tanpa Video Unboxing</Text>
          <Text style={styles.footerSubtitle}>Kerusakan/Kekurangan Tidak Diterima</Text>
          <Text style={styles.footerDate}>Tanggal order : {formatDate(data.orderDate)}</Text>
        </View>
      </Page>
    </Document>
  );
};
