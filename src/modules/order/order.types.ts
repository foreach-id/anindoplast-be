import { z } from 'zod';
import { orderSchemas } from './order.schema';
import { OrderStatus } from '@prisma/client';

export type CreateOrderDTO = z.infer<typeof orderSchemas.create>['body'];
export type UpdateOrderDTO = z.infer<typeof orderSchemas.update>['body'];
export type OrderQueryDTO = z.infer<typeof orderSchemas.queryParams>['query'];

export interface OrderIdParamDTO {
  id: number;
}

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productWeight?: number | null;
  productWidth?: number | null;
  productHeight?: number | null;
  productLength?: number | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// TAMBAHKAN: Interface untuk item input
export interface OrderItemInput {
  id?: number; // Optional: untuk update
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponseDTO {
  id: number;
  orderNumber: string;
  deliveryNumber?: string | null;

  customerId: number;
  customerName: string;
  customerPhone: string;
  customerCountryCode: string;

  customerAddressId: number;
  customerAddressFull: string;
  customerProvince: string;
  customerCity: string;
  customerDistrict: string;
  customerSubDistrict: string;
  customerZipCode: string;

  paymentMethodId: number;
  paymentMethodName: string;

  service?: string | null;
  serviceName?: string | null;
  serviceType?: string | null;
  isCod: boolean;
  isDropOff: boolean;

  orderDate: Date;
  totalAmount: number;
  shippingCost: number;
  addCost: number;
  grandTotal: number;
  status: OrderStatus;
  notes?: string | null;

  orderItems: OrderItemDTO[];

  createdAt: Date;
  updatedAt: Date;
}

export interface OrdersListResponseDTO {
  data: OrderResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
