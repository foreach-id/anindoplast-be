import { z } from 'zod';
import { statsSchemas } from './stats.schema';

export type DateRangeQueryDTO = z.infer<typeof statsSchemas.dateRange>['query'];

// Dashboard Statistics Response
export interface DashboardStatsDTO {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    thisWeekOrders: number;
    thisMonthOrders: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number; // products with 0 or low stock
  };
  customers: {
    total: number;
    newThisMonth: number;
    topCustomers: Array<{
      id: number;
      name: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
    }>;
  };
  expeditions: {
    total: number;
    active: number;
    mostUsed: Array<{
      id: number;
      name: string;
      code: string;
      orderCount: number;
    }>;
  };
}

// Sales Statistics Response
export interface SalesStatsDTO {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalShippingCost: number;
  revenueByStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    year: number;
    revenue: number;
    orderCount: number;
  }>;
  revenueByExpedition: Array<{
    expeditionName: string;
    orderCount: number;
    revenue: number;
  }>;
  revenueByPaymentMethod: Array<{
    paymentMethodName: string;
    orderCount: number;
    revenue: number;
  }>;
}

// Product Statistics Response
export interface ProductStatsDTO {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    sku: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }>;
  productsByCategory: Array<{
    category: string;
    count: number;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    sku: string;
    currentStock: number;
  }>;
}

// Customer Statistics Response
export interface CustomerStatsDTO {
  totalCustomers: number;
  newCustomersThisMonth: number;
  newCustomersThisYear: number;
  topCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date;
  }>;
  customersByLocation: Array<{
    district: string;
    customerCount: number;
  }>;
}

// Order Statistics Response
export interface OrderStatsDTO {
  totalOrders: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  ordersByMonth: Array<{
    month: string;
    year: number;
    count: number;
  }>;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  ordersByTimeOfDay: Array<{
    hour: number;
    count: number;
  }>;
}