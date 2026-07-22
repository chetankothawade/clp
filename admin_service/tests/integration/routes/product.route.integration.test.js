import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createHttpTestClient } from "../../helpers/http.js";

const isAuthenticated = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "admin" };
  next();
});
const authorizeRoles = jest.fn(() => (req, res, next) => next());
const validateRequest = jest.fn(() => (req, res, next) => next());

const listProducts = jest.fn((req, res) => res.status(200).json({ ok: "list-products" }));
const createProduct = jest.fn((req, res) => res.status(201).json({ ok: "create-product" }));
const getProduct = jest.fn((req, res) => res.status(200).json({ ok: "get-product" }));
const updateProduct = jest.fn((req, res) => res.status(200).json({ ok: "update-product" }));
const updateProductStatus = jest.fn((req, res) => res.status(200).json({ ok: "status-product" }));

jest.unstable_mockModule("../../../src/middlewares/isAuthenticated.js", () => ({
  default: isAuthenticated,
}));

jest.unstable_mockModule("../../../src/middlewares/authorizeRoles.js", () => ({
  default: authorizeRoles,
}));

jest.unstable_mockModule("../../../src/middlewares/validateRequest.js", () => ({
  validateRequest,
}));

jest.unstable_mockModule("../../../src/controllers/product.controller.js", () => ({
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  updateProductStatus,
}));

const { default: productRouter } = await import("../../../src/routes/product.route.js");

describe("product.route integration", () => {
  let client;

  beforeAll(async () => {
    client = await createHttpTestClient(productRouter, { basePath: "/api/v1/products" });
  });

  afterAll(async () => {
    await client.close();
  });

  it("GET /api/v1/products should call listProducts controller", async () => {
    const response = await client.request({
      method: "GET",
      path: "/api/v1/products",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "list-products" });
    expect(listProducts).toHaveBeenCalled();
  });

  it("POST /api/v1/products should call createProduct controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/products",
      body: { name: "Tea", price: 25 },
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({ ok: "create-product" });
    expect(createProduct).toHaveBeenCalled();
  });

  it("PATCH /api/v1/products/:uuid/status should call updateProductStatus controller", async () => {
    const response = await client.request({
      method: "PATCH",
      path: "/api/v1/products/uuid-1/status",
      body: { status: true },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "status-product" });
    expect(updateProductStatus).toHaveBeenCalled();
  });
});
