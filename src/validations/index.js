import authRules from "./auth.rules.js";
import moduleRules from "./module.rules.js";
import productRules from "./product.rules.js";
import userRules from "./user.rules.js";

export const validationRegistry = {
  auth: authRules,
  module: moduleRules,
  product: productRules,
  user: userRules,
};
