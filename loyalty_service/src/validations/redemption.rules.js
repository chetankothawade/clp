import { z } from 'zod';

const SORT_FIELDS = ['id', 'uuid', 'redeemedAt', 'pointsUsed', 'status', 'createdAt'];
const SORT_DIRECTIONS = ['ASC', 'DESC', 'asc', 'desc'];

const requiredString = (schema = z.string()) =>
  z.preprocess((value) => value ?? '', schema.trim().min(1, { message: 'validation.required' }));

const uuidParam = requiredString(z.string().uuid({ message: 'validation.invalid' }));
const optionalPositiveInteger = (max) =>
  z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce.number().int({ message: 'validation.numeric' }).positive({ message: 'validation.numeric' }).max(max, { message: 'validation.max' }).optional()
  );

export default {
  create: z.object({ reward_uuid: uuidParam }),
  list: z.object({
    page: optionalPositiveInteger(100000),
    limit: optionalPositiveInteger(100),
    sortedField: z.enum(SORT_FIELDS, { message: 'validation.in' }).optional(),
    sortedBy: z.enum(SORT_DIRECTIONS, { message: 'validation.in' }).optional(),
  }),
  get: z.object({ uuid: uuidParam }),
};
