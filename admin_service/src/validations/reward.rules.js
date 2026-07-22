import { z } from 'zod';

const REWARD_STATUSES = ['active', 'inactive'];
const SORT_FIELDS = ['id', 'uuid', 'name', 'rewardType', 'pointsRequired', 'stock', 'expiryDate', 'status', 'createdAt'];
const SORT_DIRECTIONS = ['ASC', 'DESC', 'asc', 'desc'];

const requiredString = (schema = z.string()) =>
  z.preprocess((value) => value ?? '', schema.trim().min(1, { message: 'validation.required' }));

const uuidParam = requiredString(z.string().uuid({ message: 'validation.invalid' }));
const statusField = z.preprocess((value) => value ?? '', z.enum(REWARD_STATUSES, { message: 'validation.in' }));
const optionalPositiveInteger = (max) =>
  z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce.number().int({ message: 'validation.numeric' }).positive({ message: 'validation.numeric' }).max(max, { message: 'validation.max' }).optional()
  );
const optionalDate = z.preprocess(
  (value) => (value === undefined || value === '' || value === null ? undefined : value),
  z.coerce.date({ message: 'validation.invalid' }).optional()
);

const rewardPayload = {
  name: requiredString(z.string().min(2, { message: 'validation.min' }).max(255, { message: 'validation.max' })),
  description: z.string().trim().max(10000, { message: 'validation.max' }).optional(),
  reward_type: requiredString(z.string().max(100, { message: 'validation.max' })),
  points_required: z.coerce.number().int({ message: 'validation.numeric' }).positive({ message: 'validation.numeric' }),
  stock: z.coerce.number().int({ message: 'validation.numeric' }).min(0, { message: 'validation.numeric' }),
  expiry_date: optionalDate,
};

export default {
  list: z.object({
    page: optionalPositiveInteger(100000),
    limit: optionalPositiveInteger(100),
    search: z.string().trim().max(100, { message: 'validation.max' }).optional(),
    status: z.enum(REWARD_STATUSES, { message: 'validation.in' }).optional(),
    sortedField: z.enum(SORT_FIELDS, { message: 'validation.in' }).optional(),
    sortedBy: z.enum(SORT_DIRECTIONS, { message: 'validation.in' }).optional(),
  }),
  create: z.object(rewardPayload),
  get: z.object({ uuid: uuidParam }),
  update: z.object({ uuid: uuidParam, ...rewardPayload }),
  status: z.object({ uuid: uuidParam, status: statusField }),
};
