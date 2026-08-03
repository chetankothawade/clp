import { z } from "zod";

const USER_ROLES = ["admin", "super_admin", "user"];
const USER_STATUSES = ["active", "inactive"];
const SORT_FIELDS = ["id", "uuid", "name", "email", "phone", "role", "status", "createdAt"];
const SORT_DIRECTIONS = ["ASC", "DESC", "asc", "desc"];

const requiredString = (schema = z.string()) =>
  z.preprocess((value) => value ?? "", schema.trim().min(1, { message: "validation.required" }));

const uuidParam = requiredString(z.string().uuid({ message: "validation.invalid" }));

const emailField = requiredString(
  z.string().email({ message: "validation.email" }).max(150, { message: "validation.max" })
);

const phoneField = requiredString(
  z
    .string()
    .min(8, { message: "validation.min" })
    .max(20, { message: "validation.max" })
    .regex(/^[+0-9\s()-]+$/, { message: "validation.phone_invalid" })
);

const roleField = z.preprocess(
  (value) => value ?? "",
  z.enum(USER_ROLES, { message: "validation.in" })
);

const statusField = z.preprocess(
  (value) => value ?? "",
  z.enum(USER_STATUSES, { message: "validation.in" })
);

const optionalPositiveInteger = (max) =>
  z.preprocess(
    (value) => (value === undefined || value === "" ? undefined : value),
    z.coerce.number().int({ message: "validation.numeric" }).positive({ message: "validation.numeric" }).max(max, {
      message: "validation.max",
    }).optional()
  );

const userRules = {
  list: z.object({
    page: optionalPositiveInteger(100000),
    limit: optionalPositiveInteger(100),
    search: z.string().trim().max(100, { message: "validation.max" }).optional(),
    sortedField: z.enum(SORT_FIELDS, { message: "validation.in" }).optional(),
    sortedBy: z.enum(SORT_DIRECTIONS, { message: "validation.in" }).optional(),
  }),

  create: z.object({
    name: requiredString(z.string().min(2, { message: "validation.min" }).max(100, { message: "validation.max" })),
    email: emailField,
    phone: phoneField,
    role: roleField,
    password: requiredString(z.string().min(6, { message: "validation.min" }).max(255, { message: "validation.max" })),
  }),

  update: z.object({
    uuid: uuidParam,
    name: requiredString(z.string().min(2, { message: "validation.min" }).max(100, { message: "validation.max" })),
    email: emailField,
    phone: phoneField,
    role: roleField,
  }),

  delete: z.object({
    uuid: uuidParam,
  }),

  get: z.object({
    uuid: uuidParam,
  }),

  status: z.object({
    uuid: uuidParam,
    status: statusField,
  }),

  me: z.object({}).passthrough(),
  getList: z.object({}).passthrough(),
  exportCsv: z.object({}).passthrough(),
};

export default userRules;
