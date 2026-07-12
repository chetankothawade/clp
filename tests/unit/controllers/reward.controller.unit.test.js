import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createMockReq, createMockRes } from "../../helpers/mocks.js";

const sendResponse = jest.fn();
const handleError = jest.fn();
const rewardService = {
  listRewards: jest.fn(),
  createReward: jest.fn(),
  getReward: jest.fn(),
  updateReward: jest.fn(),
  updateRewardStatus: jest.fn(),
};

jest.unstable_mockModule("../../../src/utils/response.js", () => ({
  sendResponse,
  handleError,
}));

jest.unstable_mockModule("../../../src/services/reward.service.js", () => ({
  rewardService,
}));

const { listRewards, createReward, getReward, updateReward, updateRewardStatus } = await import("../../../src/controllers/reward.controller.js");

describe("reward.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listRewards should pass the query and role to the service", async () => {
    const req = createMockReq({ query: { page: 1 }, user: { role: "user" } });
    const res = createMockRes();
    rewardService.listRewards.mockResolvedValue({ rewards: [], pagination: { total: 0 } });

    await listRewards(req, res);

    expect(rewardService.listRewards).toHaveBeenCalledWith(req.query, req.user.role);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "reward.list.success",
      { rewards: [], pagination: { total: 0 } }
    );
  });

  it("createReward should delegate to the service", async () => {
    const req = createMockReq({ body: { name: "VIP" } });
    const res = createMockRes();
    rewardService.createReward.mockResolvedValue({ id: 1, name: "VIP" });

    await createReward(req, res);

    expect(rewardService.createReward).toHaveBeenCalledWith(req.body);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      201,
      true,
      "reward.create.success",
      { reward: { id: 1, name: "VIP" } }
    );
  });

  it("getReward should return reward details", async () => {
    const req = createMockReq({ params: { uuid: "r-1" }, user: { role: "admin" } });
    const res = createMockRes();
    rewardService.getReward.mockResolvedValue({ id: 1, uuid: "r-1" });

    await getReward(req, res);

    expect(rewardService.getReward).toHaveBeenCalledWith(req.params.uuid, req.user.role);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "reward.get.success",
      { reward: { id: 1, uuid: "r-1" } }
    );
  });

  it("updateReward should forward the update payload", async () => {
    const req = createMockReq({ params: { uuid: "r-1" }, body: { name: "Gold" } });
    const res = createMockRes();
    rewardService.updateReward.mockResolvedValue({ id: 1, name: "Gold" });

    await updateReward(req, res);

    expect(rewardService.updateReward).toHaveBeenCalledWith(req.params.uuid, req.body);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "reward.update.success",
      { reward: { id: 1, name: "Gold" } }
    );
  });

  it("updateRewardStatus should route errors through handleError", async () => {
    const req = createMockReq({ params: { uuid: "r-1" }, body: { status: true } });
    const res = createMockRes();
    const error = new Error("bad");
    rewardService.updateRewardStatus.mockRejectedValue(error);

    await updateRewardStatus(req, res);

    expect(handleError).toHaveBeenCalledWith(
      req,
      res,
      error,
      expect.objectContaining({ logPrefix: "Update reward status error:" })
    );
  });
});
