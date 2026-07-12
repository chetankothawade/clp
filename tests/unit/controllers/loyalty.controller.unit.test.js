import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createMockReq, createMockRes } from "../../helpers/mocks.js";

const purchaseService = { listPurchases: jest.fn() };
const rewardService = { listRewards: jest.fn() };
const redemptionService = { listRedemptions: jest.fn() };
const dashboardService = { getDashboard: jest.fn() };

jest.unstable_mockModule("../../../services/loyalty/src/services/purchase.service.js", () => ({
  purchaseService,
}));

jest.unstable_mockModule("../../../services/loyalty/src/services/reward.service.js", () => ({
  rewardService,
}));

jest.unstable_mockModule("../../../services/loyalty/src/services/redemption.service.js", () => ({
  redemptionService,
}));

jest.unstable_mockModule("../../../services/loyalty/src/services/dashboard.service.js", () => ({
  dashboardService,
}));

const { listPurchases } = await import("../../../services/loyalty/src/controllers/loyalty.controller.js");

describe("loyalty.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listPurchases delegates to the loyalty purchase service", async () => {
    const req = createMockReq({ headers: { "x-user-id": "42" }, query: { page: 1 } });
    const res = createMockRes();
    purchaseService.listPurchases.mockResolvedValue({ purchases: [], pagination: { total: 0 } });

    await listPurchases(req, res);

    expect(purchaseService.listPurchases).toHaveBeenCalledWith(42, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "purchase.list.success",
      data: { purchases: [], pagination: { total: 0 } },
    });
  });
});
