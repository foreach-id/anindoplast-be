import { z } from 'zod';

export const customerSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      countryCode: z.string().min(1, 'Country code must be at least 1 characters'),
      phone: z.string().min(1, 'Phone must be at least 1 characters'),
      address: z.string().optional(),
      zipCode: z.string().optional(),
      provinceId: z.number().optional(),
      provinceName: z.string().optional(),
      cityId: z.number().optional(),
      cityName: z.string().optional(),
      districtId: z.number().optional(),
      districtName: z.string().optional(),
      subDistrictId: z.number().optional(),
      subDistrictName: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      countryCode: z.string().min(1, 'Country code must be at least 1 characters'),
      phone: z.string().min(1, 'Phone must be at least 1 characters'),
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
