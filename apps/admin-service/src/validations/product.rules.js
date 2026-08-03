import { z } from 'zod';

const PRODUCT_STATUSES = ['active', 'inactive'];
const SORT_FIELDS = ['id', 'uuid', 'name', 'sku', 'price', 'loyalty_points', 'status', 'createdAt'];
const SORT_DIRECTIONS = ['ASC', 'DESC', 'asc', 'desc'];

const requiredString = (schema = z.string()) =>
  z.preprocess((value) => value ?? '', schema.trim().min(1, { message: 'validation.required' }));

const uuidParam = requiredString(z.string().uuid({ message: 'validation.invalid' }));
const requiredPositiveNumber = z.coerce.number().positive({ message: 'validation.numeric' });
const requiredNonNegativeInteger = z.coerce.number().int({ message: 'validation.numeric' }).min(0, { message: 'validation.numeric' });
const requiredPositiveInteger = z.coerce.number().int({ message: 'validation.numeric' }).positive({ message: 'validation.numeric' });
const statusField = z.preprocess((value) => value ?? '', z.enum(PRODUCT_STATUSES, { message: 'validation.in' }));
const optionalPositiveInteger = (max) =>
  z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce.number().int({ message: 'validation.numeric' }).positive({ message: 'validation.numeric' }).max(max, { message: 'validation.max' }).optional()
  );

const productPayload = {
  name: requiredString(z.string().min(2, { message: 'validation.min' }).max(255, { message: 'validation.max' })),
  sku: requiredString(z.string().max(255, { message: 'validation.max' })),
  price: requiredPositiveNumber,
  description: z.string().trim().max(10000, { message: 'validation.max' }).optional(),
  loyalty_points: requiredNonNegativeInteger,
  category_id: requiredPositiveInteger,
};

export default {
  list: z.object({
    page: optionalPositiveInteger(100000),
    limit: optionalPositiveInteger(100),
    search: z.string().trim().max(100, { message: 'validation.max' }).optional(),
    status: z.enum(PRODUCT_STATUSES, { message: 'validation.in' }).optional(),
    sortedField: z.enum(SORT_FIELDS, { message: 'validation.in' }).optional(),
    sortedBy: z.enum(SORT_DIRECTIONS, { message: 'validation.in' }).optional(),
  }),
  create: z.object(productPayload),
  get: z.object({ uuid: uuidParam }),
  update: z.object({ uuid: uuidParam, ...productPayload }),
  status: z.object({ uuid: uuidParam, status: statusField }),
};
