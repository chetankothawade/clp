import authRules from "./auth.rules.js";
import moduleRules from "./module.rules.js";
import userRules from "./user.rules.js";

export const validationRegistry = {
  auth: authRules,
  module: moduleRules,
  user: userRules,
};
