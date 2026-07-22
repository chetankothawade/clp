import assert from "node:assert/strict";
import http from "node:http";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";

process.env.SECRET_KEY = "gateway-contract-secret";
process.env.JWT_ALGORITHM = "HS256";
process.env.LOYALTY_SERVICE_URL = "http://loyalty-service";

const { default: app } = await import("../app.js");

let server;
let baseUrl;

const request = ({ method = "GET", path = "/", body, headers = {} }) => new Promise((resolve, reject) => {
  const req = http.request(`${baseUrl}${path}`, { method, headers: { ...(body ? { "content-type": "application/json" } : {}), ...headers } }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve({ status: res.statusCode, headers: res.headers, body: raw ? JSON.parse(raw) : undefined });
    });
  });
  req.on("error", reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

before(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("gateway forwards purchase creation contract headers to Loyalty Service", async () => {
  const token = jwt.sign({ sub: "00000000-0000-4000-8000-000000000007", role: "user", permissions: [] }, process.env.SECRET_KEY, {
    algorithm: "HS256",
    issuer: "auth-service",
    audience: "clp-api",
  });
  let forwarded;
  globalThis.fetch = async (url, options) => {
    forwarded = { url: url.toString(), options };
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  };

  const response = await request({
    method: "POST",
    path: "/api/v1/purchases",
    headers: {
      authorization: `Bearer ${token}`,
      "x-request-id": "request-123",
      "idempotency-key": "purchase-key-123",
    },
    body: { product_uuid: "00000000-0000-4000-8000-000000000111", quantity: 1 },
  });

  assert.equal(response.status, 201);
  assert.equal(forwarded.url, "http://loyalty-service/api/v1/purchases");
  assert.equal(forwarded.options.headers["X-Request-Id"], "request-123");
  assert.equal(forwarded.options.headers["X-User-Id"], "00000000-0000-4000-8000-000000000007");
  assert.equal(forwarded.options.headers["X-User-Role"], "user");
  assert.equal(forwarded.options.headers["idempotency-key"], "purchase-key-123");
});
