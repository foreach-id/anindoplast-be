import prisma from '../../config/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import { DashboardStatsDTO, SalesStatsDTO, ProductStatsDTO, CustomerStatsDTO, OrderStatsDTO, DateRangeQueryDTO } from './stats.types';

export class StatsService {
  // =====================================================
  // DASHBOARD STATISTICS (Overview)
  // =====================================================
  static async getDashboardStats(dateRange?: DateRangeQueryDTO): Promise<DashboardStatsDTO> {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base where clause for date filtering
    const dateFilter: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      dateFilter.orderDate = {
        ...(dateRange.startDate && { gte: dateRange.startDate }),
        ...(dateRange.endDate && { lte: dateRange.endDate }),
      };
    }

    // Order Statistics
    const [totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, todayOrders, thisWeekOrders, thisMonthOrders] = await Promise.all([
      prisma.order.count({ where: { ...dateFilter } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { ...dateFilter, status: OrderStatus.CANCELLED } }),
      prisma.order.count({ where: { ...dateFilter, orderDate: { gte: startOfToday } } }),
      prisma.order.count({ where: { ...dateFilter, orderDate: { gte: startOfWeek } } }),
      prisma.order.count({ where: { ...dateFilter, orderDate: { gte: startOfMonth } } }),
    ]);

    // Revenue Statistics
    const revenueData = await prisma.order.aggregate({
      where: { ...dateFilter, status: { not: OrderStatus.CANCELLED } },
      _sum: {
        grandTotal: true,
      },
    });

    const todayRevenue = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
        orderDate: { gte: startOfToday },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const weekRevenue = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
        orderDate: { gte: startOfWeek },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const monthRevenue = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
        orderDate: { gte: startOfMonth },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const yearRevenue = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
        orderDate: { gte: startOfYear },
      },
      _sum: {
        grandTotal: true,
      },
    });

    // Product Statistics
    const [totalProducts, activeProducts, inactiveProducts] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.product.count({ where: { deletedAt: null, isActive: false } }),
    ]);

    // Customer Statistics
    const totalCustomers = await prisma.customer.count();
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    // Top Customers
    const topCustomersData = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        deletedAt: null,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          grandTotal: 'desc',
        },
      },
      take: 5,
    });

    const topCustomers = await Promise.all(
      topCustomersData.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId },
        });
        return {
          id: item.customerId,
          name: customer?.name || 'Unknown',
          phone: customer?.phone || '-',
          totalOrders: item._count.id,
          totalSpent: Number(item._sum.grandTotal || 0),
        };
      }),
    );

    // Expedition Statistics
    const [totalExpeditions, activeExpeditions] = await Promise.all([prisma.expedition.count({ where: { deletedAt: null } }), prisma.expedition.count({ where: { deletedAt: null, isActive: true } })]);

    // Most Used Expeditions
    const mostUsedExpeditionsData = await prisma.order.groupBy({
      by: ['serviceName'],
      where: {
        deletedAt: null,
        serviceName: { not: null },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          serviceName: 'desc',
        },
      },
      take: 5,
    });

    const mostUsedExpeditions = mostUsedExpeditionsData
      .filter((item) => item.serviceName)
      .map((item) => ({
        name: item.serviceName || 'Unknown',
        orderCount: item._count._all,
      }));

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        todayOrders,
        thisWeekOrders,
        thisMonthOrders,
      },
      revenue: {
        total: Number(revenueData._sum.grandTotal || 0),
        today: Number(todayRevenue._sum.grandTotal || 0),
        thisWeek: Number(weekRevenue._sum.grandTotal || 0),
        thisMonth: Number(monthRevenue._sum.grandTotal || 0),
        thisYear: Number(yearRevenue._sum.grandTotal || 0),
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        lowStock: 0, // Placeholder - implement if you have stock tracking
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        topCustomers,
      },
      expeditions: {
        total: totalExpeditions,
        active: activeExpeditions,
        mostUsed: mostUsedExpeditions.filter((e) => e !== null) as any,
      },
    };
  }

  // =====================================================
  // SALES STATISTICS
  // =====================================================
  static async getSalesStats(dateRange?: DateRangeQueryDTO): Promise<SalesStatsDTO> {
    const dateFilter: Prisma.OrderWhereInput = {
      deletedAt: null,
      status: { not: OrderStatus.CANCELLED },
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      dateFilter.orderDate = {
        ...(dateRange.startDate && { gte: dateRange.startDate }),
        ...(dateRange.endDate && { lte: dateRange.endDate }),
      };
    }

    // Total Revenue & Orders
    const [revenueData, totalOrders, shippingCostData] = await Promise.all([
      prisma.order.aggregate({
        where: dateFilter,
        _sum: {
          grandTotal: true,
        },
      }),
      prisma.order.count({ where: dateFilter }),
      prisma.order.aggregate({
        where: dateFilter,
        _sum: {
          shippingCost: true,
        },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.grandTotal || 0);
    const totalShippingCost = Number(shippingCostData._sum.shippingCost || 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by Status
    const revenueByStatusData = await prisma.order.groupBy({
      by: ['status'],
      where: dateFilter,
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByStatus = revenueByStatusData.map((item) => ({
      status: item.status,
      count: item._count.id,
      revenue: Number(item._sum.grandTotal || 0),
    }));

    // Revenue by Month
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        orderDate: true,
        grandTotal: true,
      },
    });

    const monthlyRevenue = orders.reduce(
      (acc, order) => {
        const date = new Date(order.orderDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            revenue: 0,
            count: 0,
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
          };
        }

        acc[monthYear].revenue += Number(order.grandTotal);
        acc[monthYear].count += 1;

        return acc;
      },
      {} as Record<
        string,
        {
          revenue: number;
          count: number;
          month: string;
          year: number;
        }
      >,
    );

    const revenueByMonth = Object.values(monthlyRevenue).map((item) => ({
      month: item.month,
      year: item.year,
      revenue: item.revenue,
      orderCount: item.count,
    }));

    // Revenue by Expedition
    const expeditionRevenue = await prisma.order.groupBy({
      by: ['serviceName'],
      where: {
        ...dateFilter,
        serviceName: { not: null },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        _all: true,
      },
    });

    const revenueByExpedition = expeditionRevenue
      .filter((item) => item.serviceName)
      .map((item) => ({
        expeditionName: item.serviceName || 'Unknown',
        orderCount: item._count._all,
        revenue: Number(item._sum?.grandTotal || 0),
      }));

    // Revenue by Payment Method
    const paymentRevenue = await prisma.order.groupBy({
      by: ['paymentMethodId'],
      where: dateFilter,
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByPaymentMethod = await Promise.all(
      paymentRevenue.map(async (item) => {
        const method = await prisma.paymentMethod.findUnique({
          where: { id: item.paymentMethodId },
        });
        return {
          paymentMethodName: method?.name || 'Unknown',
          orderCount: item._count.id,
          revenue: Number(item._sum.grandTotal || 0),
        };
      }),
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalShippingCost,
      revenueByStatus,
      revenueByMonth,
      revenueByExpedition: revenueByExpedition.filter((e) => e !== null) as any,
      revenueByPaymentMethod,
    };
  }

  // =====================================================
  // PRODUCT STATISTICS
  // =====================================================
  static async getProductStats(): Promise<ProductStatsDTO> {
    const [totalProducts, activeProducts, inactiveProducts] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.product.count({ where: { deletedAt: null, isActive: false } }),
    ]);

    // Top Selling Products
    const topSellingData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const topSellingProducts = await Promise.all(
      topSellingData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          id: item.productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || '-',
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.subtotal || 0),
        };
      }),
    );

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      topSellingProducts,
      productsByCategory: [], // Placeholder - implement if you have categories
      lowStockProducts: [], // Placeholder - implement if you have stock tracking
    };
  }

  // =====================================================
  // CUSTOMER STATISTICS
  // =====================================================
  static async getCustomerStats(): Promise<CustomerStatsDTO> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalCustomers, newCustomersThisMonth, newCustomersThisYear] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.customer.count({
        where: {
          createdAt: { gte: startOfYear },
        },
      }),
    ]);

    // Top Customers with Last Order Date
    const topCustomersData = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        deletedAt: null,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
      _max: {
        orderDate: true,
      },
      orderBy: {
        _sum: {
          grandTotal: 'desc',
        },
      },
      take: 10,
    });

    const topCustomers = await Promise.all(
      topCustomersData.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId },
        });
        return {
          id: item.customerId,
          name: customer?.name || 'Unknown',
          phone: customer?.phone || '-',
          totalOrders: item._count.id,
          totalSpent: Number(item._sum.grandTotal || 0),
          lastOrderDate: item._max.orderDate || new Date(),
        };
      }),
    );

    // Customers by Location (District)
    const locationData = await prisma.customerAddress.groupBy({
      by: ['districtId'],
      _count: {
        customerId: true,
      },
      orderBy: {
        _count: {
          customerId: 'desc',
        },
      },
      take: 10,
    });

    const customersByLocation = locationData.map((item) => ({
      district: `District ${item.districtId}`, // You may want to join with a districts table
      customerCount: item._count.customerId,
    }));

    return {
      totalCustomers,
      newCustomersThisMonth,
      newCustomersThisYear,
      topCustomers,
      customersByLocation,
    };
  }

  // =====================================================
  // ORDER STATISTICS
  // =====================================================
  static async getOrderStats(dateRange?: DateRangeQueryDTO): Promise<OrderStatsDTO> {
    const dateFilter: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      dateFilter.orderDate = {
        ...(dateRange.startDate && { gte: dateRange.startDate }),
        ...(dateRange.endDate && { lte: dateRange.endDate }),
      };
    }

    const totalOrders = await prisma.order.count({ where: dateFilter });

    // Orders by Status
    const ordersByStatusData = await prisma.order.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const ordersByStatus = ordersByStatusData.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage: totalOrders > 0 ? (item._count.id / totalOrders) * 100 : 0,
    }));

    // Orders by Month
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        orderDate: true,
      },
    });

    const monthlyOrders = orders.reduce(
      (acc, order) => {
        const date = new Date(order.orderDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            count: 0,
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
          };
        }

        acc[monthYear].count += 1;

        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          month: string;
          year: number;
        }
      >,
    );

    const ordersByMonth = Object.values(monthlyOrders);

    // Average Order Value
    const revenueData = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const validOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: { not: OrderStatus.CANCELLED },
      },
    });

    const averageOrderValue = validOrders > 0 ? Number(revenueData._sum.grandTotal || 0) / validOrders : 0;

    // Average Items Per Order
    const itemsData = await prisma.orderItem.aggregate({
      where: {
        order: dateFilter,
      },
      _sum: {
        quantity: true,
      },
    });

    const averageItemsPerOrder = totalOrders > 0 ? (itemsData._sum.quantity || 0) / totalOrders : 0;

    // Orders by Time of Day
    const ordersWithTime = await prisma.order.findMany({
      where: dateFilter,
      select: {
        orderDate: true,
      },
    });

    const hourlyOrders = ordersWithTime.reduce(
      (acc, order) => {
        const hour = new Date(order.orderDate).getHours();
        if (!acc[hour]) {
          acc[hour] = 0;
        }
        acc[hour] += 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const ordersByTimeOfDay = Object.entries(hourlyOrders).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }));

    return {
      totalOrders,
      ordersByStatus,
      ordersByMonth,
      averageOrderValue,
      averageItemsPerOrder,
      ordersByTimeOfDay,
    };
  }
}
