import purchaseRules from "./purchase.rules.js";
import redemptionRules from "./redemption.rules.js";
import rewardRules from "./reward.rules.js";
import dashboardRules from "./dashboard.rules.js";

export const validationRegistry = {
  purchase: purchaseRules,
  redemption: redemptionRules,
  reward: rewardRules,
  dashboard: dashboardRules,
};
