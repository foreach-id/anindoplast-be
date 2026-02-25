import prisma from '../../config/prisma';
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from './customerAddress.types';

export class CustomerAddressService {
  static async getAll(id: number) {
    const customerAddresss = await prisma.customerAddress.findMany({
      where: {
        customerId: id,
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customerAddresss.map((address) => ({
      id: address.id,
      address: address.address,
      zipCode: address.zipCode,
      provinceId: address.provinceId,
      provinceName: address.provinceName,
      cityId: address.cityId,
      cityName: address.cityName,
      districtId: address.districtId,
      districtName: address.districtName,
      subDistrictId: address.subDistrictId,
      subDistrictName: address.subDistrictName,
      customerId: address.customerId,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      createdBy: address.creator.name,
      updatedBy: address.updater?.name || null,
    }));
  }

  static async getById(id: number) {
    const customerAddress = await prisma.customerAddress.findFirst({
      where: {
        id,
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
      },
    });

    if (!customerAddress) {
      throw new Error('Customer address not found');
    }

    return {
      id: customerAddress.id,
      address: customerAddress.address,
      zipCode: customerAddress.zipCode,
      provinceId: customerAddress.provinceId,
      provinceName: customerAddress.provinceName,
      cityId: customerAddress.cityId,
      cityName: customerAddress.cityName,
      districtId: customerAddress.districtId,
      districtName: customerAddress.districtName,
      subDistrictId: customerAddress.subDistrictId,
      subDistrictName: customerAddress.subDistrictName,
      customerId: customerAddress.customerId,
      createdAt: customerAddress.createdAt,
      updatedAt: customerAddress.updatedAt,
      createdBy: customerAddress.creator.name,
      updatedBy: customerAddress.updater?.name || null,
    };
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
        zipCode: data.zipCode,
        provinceId: data.provinceId,
        provinceName: data.provinceName,
        cityId: data.cityId,
        cityName: data.cityName,
        districtId: data.districtId,
        districtName: data.districtName,
        subDistrictId: data.subDistrictId,
        subDistrictName: data.subDistrictName,
        customerId: data.customerId,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
      },
    });

    return {
      id: newCustomerAddress.id,
      address: newCustomerAddress.address,
      zipCode: newCustomerAddress.zipCode,
      provinceId: newCustomerAddress.provinceId,
      provinceName: newCustomerAddress.provinceName,
      cityId: newCustomerAddress.cityId,
      cityName: newCustomerAddress.cityName,
      districtId: newCustomerAddress.districtId,
      districtName: newCustomerAddress.districtName,
      subDistrictId: newCustomerAddress.subDistrictId,
      subDistrictName: newCustomerAddress.subDistrictName,
      customerId: newCustomerAddress.customerId,
      createdAt: newCustomerAddress.createdAt,
      updatedAt: newCustomerAddress.updatedAt,
      createdBy: newCustomerAddress.creator.name,
      updatedBy: newCustomerAddress.updater?.name || null,
    };
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
        zipCode: data.zipCode,
        provinceId: data.provinceId,
        provinceName: data.provinceName,
        cityId: data.cityId,
        cityName: data.cityName,
        districtId: data.districtId,
        districtName: data.districtName,
        subDistrictId: data.subDistrictId,
        subDistrictName: data.subDistrictName,
        customerId: data.customerId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      include: {
        creator: { select: { name: true } },
        updater: { select: { name: true } },
      },
    });

    return {
      id: updatedCustomerAddress.id,
      address: updatedCustomerAddress.address,
      zipCode: updatedCustomerAddress.zipCode,
      provinceId: updatedCustomerAddress.provinceId,
      provinceName: updatedCustomerAddress.provinceName,
      cityId: updatedCustomerAddress.cityId,
      cityName: updatedCustomerAddress.cityName,
      districtId: updatedCustomerAddress.districtId,
      districtName: updatedCustomerAddress.districtName,
      subDistrictId: updatedCustomerAddress.subDistrictId,
      subDistrictName: updatedCustomerAddress.subDistrictName,
      customerId: updatedCustomerAddress.customerId,
      createdAt: updatedCustomerAddress.createdAt,
      updatedAt: updatedCustomerAddress.updatedAt,
      createdBy: updatedCustomerAddress.creator.name,
      updatedBy: updatedCustomerAddress.updater?.name || null,
    };
  }
}
