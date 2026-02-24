import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from './customer.types';

export class CustomerService {
  static async getAll() {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return customers;
  }

  static async getPaginated(query: CustomerQueryDTO) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CustomerWhereInput = {};

    if (search) {
      whereClause.OR = [{ name: { contains: search } }];
    }

    const [data, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where: whereClause,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    return {
      data: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const customer = await prisma.customer.findFirst({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  static async create(data: CreateCustomerDTO, userId: number | undefined) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { phone: data.phone },
    });

    if (existingCustomer) {
      throw new Error('Phone already exists');
    }

    if (typeof userId !== 'number') {
      throw new Error('User ID is required for creating Customer');
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: data.name,
        countryCode: data.countryCode,
        phone: data.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      },
    });

    let newAddress;
    if (data.address && data.zipCode && data.provinceId && data.provinceName && data.cityId && data.cityName && data.districtId && data.districtName && data.subDistrictId && data.subDistrictName) {
      newAddress = await prisma.customerAddress.create({
        data: {
          customerId: newCustomer.id,
          address: data.address,
          zipCode: data.zipCode,
          provinceId: data.provinceId,
          provinceName: data.provinceName,
          cityId: data.cityId,
          cityName: data.cityName,
          districtId: data.districtId,
          districtName: data.districtName,
          subDistrictId: data.subDistrictId,
          subDistrictName: data.subDistrictName,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }

    if (newAddress) {
      return {
        ...newCustomer,
        address: newAddress.address,
        zipCode: newAddress.zipCode,
        provinceId: newAddress.provinceId,
        provinceName: newAddress.provinceName,
        cityId: newAddress.cityId,
        cityName: newAddress.cityName,
        districtId: newAddress.districtId,
        districtName: newAddress.districtName,
        subDistrictId: newAddress.subDistrictId,
        subDistrictName: newAddress.subDistrictName,
      };
    }

    return newCustomer;
  }

  static async update(id: number, data: UpdateCustomerDTO, userId: number | undefined) {
    const customer = await prisma.customer.findFirst({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (data.name && data.name !== customer.name) {
      const existingName = await prisma.customer.findFirst({
        where: { name: data.name },
      });
      if (existingName) {
        throw new Error('Name already exists');
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        countryCode: data.countryCode,
        phone: data.phone,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return updatedCustomer;
  }
}
