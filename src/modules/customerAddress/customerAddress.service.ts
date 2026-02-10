import prisma from '../../config/prisma';
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from './customerAddress.types';

export class CustomerAddressService {
  static async getAll(id: number) {
    const customerAddresss = await prisma.customerAddress.findMany({
      where: {
        customerId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return customerAddresss;
  }

  static async getById(id: number) {
    const customerAddress = await prisma.customerAddress.findFirst({
      where: {
        id,
      },
    });

    if (!customerAddress) {
      throw new Error('Customer address not found');
    }

    return customerAddress;
  }

  static async create(data: CreateCustomerAddressDTO, userId: number | undefined) {
    const existingCustomerAddress = await prisma.customerAddress.findFirst({
      where: { address: data.address },
    });

    if (existingCustomerAddress) {
      throw new Error('Address already exists');
    }

    if (typeof userId !== 'number') {
      throw new Error('User ID is required for creating Customer address');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const newCustomerAddress = await prisma.customerAddress.create({
      data: {
        address: data.address,
        districtId: data.districtId,
        customerId: data.customerId,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return newCustomerAddress;
  }

  static async update(id: number, data: UpdateCustomerAddressDTO, userId: number | undefined) {
    const customerAddress = await prisma.customerAddress.findFirst({
      where: {
        id,
      },
    });

    if (!customerAddress) {
      throw new Error('Customer address not found');
    }

    if (data.address && data.address !== customerAddress.address) {
      const existingAddress = await prisma.customerAddress.findFirst({
        where: { address: data.address },
      });
      if (existingAddress) {
        throw new Error('Address already exists');
      }
    }

    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomerAddress = await prisma.customerAddress.update({
      where: { id },
      data: {
        address: data.address,
        districtId: data.districtId,
        customerId: data.customerId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return updatedCustomerAddress;
  }
}
