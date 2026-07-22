import http from "node:http";
import express from "express";

const buildUrl = (baseUrl, path) => new URL(path, baseUrl).toString();

function makeHttpRequest(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      url,
      {
        method,
        headers,
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8");
          const contentType = response.headers["content-type"] || "";
          const data = contentType.includes("application/json") && rawBody
            ? JSON.parse(rawBody)
            : rawBody;

          resolve({
            status: response.statusCode || 200,
            data,
            headers: response.headers,
          });
        });
      },
    );

    request.on("error", reject);

    if (body !== undefined) {
      request.write(body);
    }

    request.end();
  });
}

export async function createHttpTestClient(router, { basePath = "/" } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(basePath, router);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const request = async ({
    method = "GET",
    path = "/",
    body,
    headers = {},
  } = {}) => {
    const response = await makeHttpRequest(buildUrl(baseUrl, path), {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  };

  const close = async () =>
    new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  return { request, close };
}

