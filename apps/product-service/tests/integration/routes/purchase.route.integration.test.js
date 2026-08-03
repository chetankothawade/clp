import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createHttpTestClient } from "../../helpers/http.js";

const isAuthenticated = jest.fn((req, res, next) => {
  req.user = { id: 7, role: "user" };
  next();
});
const authorizeRoles = jest.fn(() => (req, res, next) => next());
const validateRequest = jest.fn(() => (req, res, next) => next());

const createPurchase = jest.fn((req, res) => res.status(201).json({ ok: "create-purchase" }));
const listPurchases = jest.fn((req, res) => res.status(200).json({ ok: "list-purchases" }));
const getPurchase = jest.fn((req, res) => res.status(200).json({ ok: "get-purchase" }));

jest.unstable_mockModule("../../../src/middlewares/isAuthenticated.js", () => ({
  default: isAuthenticated,
}));

jest.unstable_mockModule("../../../src/middlewares/authorizeRoles.js", () => ({
  default: authorizeRoles,
}));

jest.unstable_mockModule("../../../src/middlewares/validateRequest.js", () => ({
  validateRequest,
}));

jest.unstable_mockModule("../../../src/controllers/purchase.controller.js", () => ({
  createPurchase,
  listPurchases,
  getPurchase,
}));

const { default: purchaseRouter } = await import("../../../src/routes/purchase.route.js");

describe("purchase.route integration", () => {
  let client;

  beforeAll(async () => {
    client = await createHttpTestClient(purchaseRouter, { basePath: "/api/v1/purchases" });
  });

  afterAll(async () => {
    await client.close();
  });

  it("POST /api/v1/purchases should call createPurchase controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/purchases",
      body: { amount: 120 },
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({ ok: "create-purchase" });
    expect(createPurchase).toHaveBeenCalled();
  });

  it("GET /api/v1/purchases should call listPurchases controller", async () => {
    const response = await client.request({
      method: "GET",
      path: "/api/v1/purchases",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "list-purchases" });
    expect(listPurchases).toHaveBeenCalled();
  });

  it("GET /api/v1/purchases/:uuid should call getPurchase controller", async () => {
    const response = await client.request({
      method: "GET",
      path: "/api/v1/purchases/p-1",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "get-purchase" });
    expect(getPurchase).toHaveBeenCalled();
  });
});
