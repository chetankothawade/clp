import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createHttpTestClient } from "../../helpers/http.js";

const isAuthenticated = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "admin" };
  next();
});
const validateRequest = jest.fn(() => (req, res, next) => next());

const listModule = jest.fn((req, res) => res.status(200).json({ ok: "list-module" }));
const createModule = jest.fn((req, res) => res.status(201).json({ ok: "create-module" }));
const updateModule = jest.fn((req, res) => res.status(200).json({ ok: "update-module" }));
const deleteModule = jest.fn((req, res) => res.status(200).json({ ok: "delete-module" }));
const getModule = jest.fn((req, res) => res.status(200).json({ ok: "get-module" }));
const moduleStatus = jest.fn((req, res) => res.status(200).json({ ok: "status-module" }));
const getModuleList = jest.fn((req, res) => res.status(200).json({ ok: "getlist-module" }));

jest.unstable_mockModule("../../../src/middlewares/isAuthenticated.js", () => ({
  default: isAuthenticated,
}));

jest.unstable_mockModule("../../../src/middlewares/validateRequest.js", () => ({
  validateRequest,
}));

jest.unstable_mockModule("../../../src/controllers/module.controller.js", () => ({
  listModule,
  createModule,
  updateModule,
  deleteModule,
  getModule,
  moduleStatus,
  getModuleList,
}));

const { default: moduleRouter } = await import("../../../src/routes/module.route.js");

describe("module.route integration", () => {
  let client;

  beforeAll(async () => {
    client = await createHttpTestClient(moduleRouter, { basePath: "/api/v1/module" });
  });

  afterAll(async () => {
    await client.close();
  });

  it("GET /api/v1/module/list should call listModule controller", async () => {
    const response = await client.request({
      method: "GET",
      path: "/api/v1/module/list",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "list-module" });
    expect(listModule).toHaveBeenCalled();
  });

  it("POST /api/v1/module/create should call createModule controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/module/create",
      body: { name: "Users", seq_no: 1 },
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({ ok: "create-module" });
    expect(createModule).toHaveBeenCalled();
  });
});
