import db from "../models/index.js";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const modelCache = new Map();

function resolveModel(tableName) {
  if (!tableName) return null;

  const normalized = String(tableName).trim();
  if (modelCache.has(normalized)) {
    return modelCache.get(normalized);
  }

  const singular = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  const candidates = [
    normalized,
    normalized.toLowerCase(),
    singular,
    singular.toLowerCase(),
    singular.charAt(0).toUpperCase() + singular.slice(1),
  ];

  for (const modelName of candidates) {
    const model = db[modelName];
    if (model && typeof model.findOne === "function") {
      modelCache.set(normalized, model);
      return model;
    }
  }

  modelCache.set(normalized, null);
  return null;
}

function normalizeRuleDefinition(ruleDefinition) {
  if (typeof ruleDefinition === "object" && ruleDefinition !== null) {
    return {
      ruleString: String(ruleDefinition.rules || ""),
      customMessages: ruleDefinition.message || {},
    };
  }

  return {
    ruleString: String(ruleDefinition || ""),
    customMessages: {},
  };
}

function buildFieldHelpers(field, customMessages) {
  const makeError = (key, params = {}) => ({
    key,
    params: {
      field,
      ...params,
    },
  });

  const getMessage = (ruleName, defaultMessage) => {
    const customMessage = customMessages?.[ruleName];
    if (!customMessage) {
      return defaultMessage;
    }

    if (typeof customMessage === "string") {
      return {
        key: customMessage,
        params: defaultMessage?.params || { field },
      };
    }

    if (typeof customMessage === "object" && customMessage.key) {
      return {
        key: customMessage.key,
        params: {
          ...(defaultMessage?.params || { field }),
          ...(customMessage.params || {}),
        },
      };
    }

    return customMessage;
  };

  return { makeError, getMessage };
}

async function validateRule({ ruleName, ruleValue, value, field, data, files, helpers }) {
  const { makeError, getMessage } = helpers;

  switch (ruleName) {
    case "required":
      if (value === undefined || value === null || value === "") {
        return getMessage(ruleName, makeError("validation.required"));
      }
      return null;

    case "email":
      if (value && !EMAIL_REGEX.test(value)) {
        return getMessage(ruleName, makeError("validation.email"));
      }
      return null;

    case "min": {
      const min = Number(ruleValue);
      if (value && String(value).length < min) {
        return getMessage(ruleName, makeError("validation.min", { min }));
      }
      return null;
    }

    case "max": {
      const max = Number(ruleValue);
      if (value && String(value).length > max) {
        return getMessage(ruleName, makeError("validation.max", { max }));
      }
      return null;
    }

    case "numeric":
      if (value && Number.isNaN(Number(value))) {
        return getMessage(ruleName, makeError("validation.numeric"));
      }
      return null;

    case "boolean":
      if (typeof value !== "boolean") {
        return getMessage(ruleName, makeError("validation.boolean"));
      }
      return null;

    case "in": {
      const options = String(ruleValue || "").split(",");
      if (!options.includes(value)) {
        return getMessage(ruleName, makeError("validation.in"));
      }
      return null;
    }

    case "confirmed":
      if (value !== data[`${field}_confirmation`]) {
        return getMessage(ruleName, makeError("validation.confirmed"));
      }
      return null;

    case "unique": {
      const [table, column] = String(ruleValue || "").split(",");
      const model = resolveModel(table);

      if (!model || !column) {
        return getMessage(ruleName, makeError("validation.invalid"));
      }

      const exists = await model.findOne({ where: { [column]: value } });
      return exists ? getMessage(ruleName, makeError("validation.unique")) : null;
    }

    case "exists": {
      const [table, column] = String(ruleValue || "").split(",");
      const model = resolveModel(table);

      if (!model || !column) {
        return getMessage(ruleName, makeError("validation.invalid"));
      }

      const record = await model.findOne({ where: { [column]: value } });
      return record ? null : getMessage(ruleName, makeError("validation.exists"));
    }

    case "array":
      if (!Array.isArray(value)) {
        return getMessage(ruleName, makeError("validation.array"));
      }
      return null;

    case "file":
      if (!files[field]) {
        return getMessage(ruleName, makeError("validation.file"));
      }
      return null;

    case "mimes": {
      const allowed = String(ruleValue || "").split(",");
      const file = files[field];
      if (file) {
        const ext = String(file.originalname || "").split(".").pop();
        if (!allowed.includes(ext)) {
          return getMessage(ruleName, makeError("validation.mimes"));
        }
      }
      return null;
    }

    case "maxFile": {
      const file = files[field];
      if (file) {
        const maxKb = Number(ruleValue);
        const sizeKB = file.size / 1024;

        if (sizeKB > maxKb) {
          return getMessage(ruleName, makeError("validation.maxFile"));
        }
      }
      return null;
    }

    default:
      return null;
  }
}

export async function validateRules(rules, data, files = {}) {
  const errors = {};

  for (const [field, ruleDefinition] of Object.entries(rules || {})) {
    const { ruleString, customMessages } = normalizeRuleDefinition(ruleDefinition);
    const helpers = buildFieldHelpers(field, customMessages);
    const value = data[field];
    const ruleList = ruleString.split("|").filter(Boolean);

    for (const rule of ruleList) {
      const [ruleName, ruleValue] = rule.split(":");
      const error = await validateRule({
        ruleName,
        ruleValue,
        value,
        field,
        data,
        files,
        helpers,
      });

      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}
