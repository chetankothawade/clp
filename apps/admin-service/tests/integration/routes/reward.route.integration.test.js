import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createHttpTestClient } from "../../helpers/http.js";

const isAuthenticated = jest.fn((req, res, next) => {
  req.user = { id: 8, role: "admin" };
  next();
});
const authorizeRoles = jest.fn(() => (req, res, next) => next());
const validateRequest = jest.fn(() => (req, res, next) => next());

const listRewards = jest.fn((req, res) => res.status(200).json({ ok: "list-rewards" }));
const createReward = jest.fn((req, res) => res.status(201).json({ ok: "create-reward" }));
const getReward = jest.fn((req, res) => res.status(200).json({ ok: "get-reward" }));
const updateReward = jest.fn((req, res) => res.status(200).json({ ok: "update-reward" }));
const updateRewardStatus = jest.fn((req, res) => res.status(200).json({ ok: "status-reward" }));

jest.unstable_mockModule("../../../src/middlewares/isAuthenticated.js", () => ({
  default: isAuthenticated,
}));

jest.unstable_mockModule("../../../src/middlewares/authorizeRoles.js", () => ({
  default: authorizeRoles,
}));

jest.unstable_mockModule("../../../src/middlewares/validateRequest.js", () => ({
  validateRequest,
}));

jest.unstable_mockModule("../../../src/controllers/reward.controller.js", () => ({
  listRewards,
  createReward,
  getReward,
  updateReward,
  updateRewardStatus,
}));

const { default: rewardRouter } = await import("../../../src/routes/reward.route.js");

describe("reward.route integration", () => {
  let client;

  beforeAll(async () => {
    client = await createHttpTestClient(rewardRouter, { basePath: "/api/v1/rewards" });
  });

  afterAll(async () => {
    await client.close();
  });

  it("GET /api/v1/rewards should call listRewards controller", async () => {
    const response = await client.request({
      method: "GET",
      path: "/api/v1/rewards",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "list-rewards" });
    expect(listRewards).toHaveBeenCalled();
  });

  it("POST /api/v1/rewards should call createReward controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/rewards",
      body: { name: "VIP" },
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({ ok: "create-reward" });
    expect(createReward).toHaveBeenCalled();
  });

  it("PATCH /api/v1/rewards/:uuid/status should call updateRewardStatus controller", async () => {
    const response = await client.request({
      method: "PATCH",
      path: "/api/v1/rewards/r-1/status",
      body: { status: true },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "status-reward" });
    expect(updateRewardStatus).toHaveBeenCalled();
  });
});
