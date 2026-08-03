import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createHttpTestClient } from "../../helpers/http.js";

const validateRequest = jest.fn(() => (req, res, next) => next());
const register = jest.fn((req, res) => res.status(200).json({ ok: "register" }));
const login = jest.fn((req, res) => res.status(200).json({ ok: "login" }));
const logout = jest.fn((req, res) => res.status(200).json({ ok: "logout" }));
const forgotPassword = jest.fn((req, res) => res.status(200).json({ ok: "forgot" }));
const resetPassword = jest.fn((req, res) => res.status(200).json({ ok: "reset" }));

jest.unstable_mockModule("../../../src/middlewares/validateRequest.js", () => ({
  validateRequest,
}));

jest.unstable_mockModule("../../../src/controllers/auth.controller.js", () => ({
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
}));

const { default: authRouter } = await import("../../../src/routes/auth.route.js");

describe("auth.route integration", () => {
  let client;

  beforeAll(async () => {
    client = await createHttpTestClient(authRouter, { basePath: "/api/v1" });
  });

  afterAll(async () => {
    await client.close();
  });

  it("POST /api/v1/register should hit register controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/register",
      body: { first_name: "A", last_name: "B", email: "a@a.com", phone: "9876543210", password: "secret", password_confirmation: "secret" },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "register" });
    expect(register).toHaveBeenCalled();
  });

  it("POST /api/v1/login should hit login controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/login",
      body: { email: "a@a.com", password: "secret" },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "login" });
    expect(login).toHaveBeenCalled();
  });

  it("POST /api/v1/forgot-password should hit forgotPassword controller", async () => {
    const response = await client.request({
      method: "POST",
      path: "/api/v1/forgot-password",
      body: { email: "a@a.com" },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "forgot" });
    expect(forgotPassword).toHaveBeenCalled();
  });

  it("PUT /api/v1/reset-password/:token should hit resetPassword controller", async () => {
    const response = await client.request({
      method: "PUT",
      path: "/api/v1/reset-password/token-123",
      body: { password: "new-secret" },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: "reset" });
    expect(resetPassword).toHaveBeenCalled();
  });
});
