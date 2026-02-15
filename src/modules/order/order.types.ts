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
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethodId: number;
  paymentMethodName: string;
  serviceExpeditionId?: number;
  serviceExpeditionName?: string;
  expeditionId?: number;
  expeditionName?: string;
  orderDate: Date;
  totalAmount: number;
  shippingCost: number;
  grandTotal: number;
  status: OrderStatus;
  notes?: string;
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