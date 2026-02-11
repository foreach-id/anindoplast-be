export interface ReceiptData {
  deliveryNumber: string;
  orderNumber: string;
  codAmount: number;
  recipient: {
    name: string;
    phone: string;
    address: string;
    district: string;
    city: string;
    province: string;
  };
  sender: {
    name: string;
    phone: string;
    district: string;
  };
  items: {
    name: string;
    quantity: number;
  }[];
  weight: number;
  orderDate: Date;
  notes?: string;
  serviceExpeditionCode?: string;
  serviceExpeditionName?: string;
}

export interface GenerateReceiptRequest {
  deliveryNumber: string;
}
