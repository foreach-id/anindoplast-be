import { z } from 'zod';

export const customerAddressSchemas = {
  create: z.object({
    body: z.object({
      customerId: z.number().int().min(1, 'Customer is required'),
      address: z.string().min(3, 'Address must be at least 3 characters'),
      zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
      provinceId: z.number().int().min(1, 'Province is required'),
      provinceName: z.string().min(1, 'Province name is required'),
      cityId: z.number().int().min(1, 'City is required'),
      cityName: z.string().min(1, 'City name is required'),
      districtId: z.number().int().min(1, 'District is required'),
      districtName: z.string().min(1, 'District name is required'),
      subDistrictId: z.number().int().min(1, 'Sub-district is required'),
      subDistrictName: z.string().min(1, 'Sub-district name is required'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      customerId: z.number().int().min(1, 'Customer is required'),
      address: z.string().min(3, 'Address must be at least 3 characters'),
      zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
      provinceId: z.number().int().min(1, 'Province is required'),
      provinceName: z.string().min(1, 'Province name is required'),
      cityId: z.number().int().min(1, 'City is required'),
      cityName: z.string().min(1, 'City name is required'),
      districtId: z.number().int().min(1, 'District is required'),
      districtName: z.string().min(1, 'District name is required'),
      subDistrictId: z.number().int().min(1, 'Sub-district is required'),
      subDistrictName: z.string().min(1, 'Sub-district name is required'),
    }),
  }),

  idParam: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),

  queryParams: z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
      search: z.string().optional(),
    }),
  }),
};
