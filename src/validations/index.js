import authRules from "./auth.rules.js";
import moduleRules from "./module.rules.js";
import productRules from "./product.rules.js";
import purchaseRules from "./purchase.rules.js";
import redemptionRules from "./redemption.rules.js";
import rewardRules from "./reward.rules.js";
import userRules from "./user.rules.js";

export const validationRegistry = {
  auth: authRules,
  module: moduleRules,
  product: productRules,
  purchase: purchaseRules,
  redemption: redemptionRules,
  reward: rewardRules,
  user: userRules,
};
