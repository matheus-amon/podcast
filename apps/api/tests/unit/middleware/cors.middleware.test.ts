import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { Elysia } from "elysia";
import { corsMiddleware } from "../../../src/middleware/cors.middleware";

describe("CORS Middleware", () => {
  let app: Elysia;
  const originalEnv = process.env.ALLOWED_ORIGINS;

  beforeEach(() => {
    delete process.env.ALLOWED_ORIGINS;
    app = new Elysia().use(corsMiddleware()).get("/", () => "Hello World");
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ALLOWED_ORIGINS = originalEnv;
    } else {
      delete process.env.ALLOWED_ORIGINS;
    }
  });

  it("should use default origin if ALLOWED_ORIGINS is not set and no origin header is provided", async () => {
    const request = new Request("http://localhost/");
    const response = await app.handle(request);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("should use the exact configured origin if ALLOWED_ORIGINS has only one custom origin and no origin header is provided", async () => {
    process.env.ALLOWED_ORIGINS = "https://myapp.com";

    const request = new Request("http://localhost/");
    const response = await app.handle(request);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://myapp.com");
  });

  it("should return the requested origin if it matches one of the ALLOWED_ORIGINS", async () => {
    process.env.ALLOWED_ORIGINS = "https://myapp.com, https://admin.myapp.com";

    const request = new Request("http://localhost/", {
      headers: { origin: "https://admin.myapp.com" }
    });
    const response = await app.handle(request);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://admin.myapp.com");
  });

  it("should return the default origin if the requested origin DOES NOT match multiple ALLOWED_ORIGINS", async () => {
    process.env.ALLOWED_ORIGINS = "https://myapp.com, https://admin.myapp.com";

    const request = new Request("http://localhost/", {
      headers: { origin: "https://evil.com" }
    });
    const response = await app.handle(request);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    // Since it returns localhost:3000 for a request from evil.com, evil.com will block the response because
    // it's not evil.com (due to credentials: true)
  });

  it("should handle preflight OPTIONS requests properly", async () => {
    process.env.ALLOWED_ORIGINS = "https://myapp.com";

    const request = new Request("http://localhost/", {
      method: "OPTIONS",
      headers: { origin: "https://myapp.com" }
    });
    const response = await app.handle(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://myapp.com");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("OPTIONS");
    expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
