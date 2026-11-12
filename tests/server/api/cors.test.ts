import { describe, expect, it } from "vitest";

import { handle, noContent, ok } from "@/server/api/respond";
import { allowedOrigins, corsHeaders } from "@/server/api/cors";

const from = (origin: string | null, method = "GET") =>
  new Request("http://localhost/api/v1/me", {
    method,
    headers: origin ? { origin } : {},
  });

describe("allowedOrigins", () => {
  it("splits and trims the comma-separated list", () => {
    expect(allowedOrigins("https://a.app, wails://wails.localhost ,")).toEqual([
      "https://a.app",
      "wails://wails.localhost",
    ]);
  });

  it("is empty when the variable is unset", () => {
    expect(allowedOrigins(undefined)).toEqual([]);
  });
});

describe("corsHeaders", () => {
  it("echoes a listed origin with the allowed methods and headers", () => {
    const headers = corsHeaders(from("https://a.app"), ["https://a.app"]);
    expect(headers.get("access-control-allow-origin")).toBe("https://a.app");
    expect(headers.get("vary")).toBe("origin");
    expect(headers.get("access-control-allow-methods")).toBe(
      "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    );
    expect(headers.get("access-control-allow-headers")).toBe(
      "authorization, content-type",
    );
    expect(headers.get("access-control-max-age")).toBe("600");
  });

  it("returns nothing for an unlisted origin or no origin", () => {
    expect([
      ...corsHeaders(from("https://evil.app"), ["https://a.app"]).keys(),
    ]).toEqual([]);
    expect([...corsHeaders(from(null), ["https://a.app"]).keys()]).toEqual([]);
  });
});

describe("handle with cors", () => {
  it("adds the cors headers to a normal response for a listed origin", async () => {
    const response = await handle(
      async () => ok({ a: 1 }),
      ["https://a.app"],
    )({
      request: from("https://a.app"),
      params: {},
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://a.app",
    );
  });

  it("answers a preflight from a listed origin with 204 and the headers", async () => {
    const response = await handle(
      async () => noContent(),
      ["https://a.app"],
    )({
      request: from("https://a.app", "OPTIONS"),
      params: {},
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "OPTIONS",
    );
  });

  it("adds no cors headers for an unlisted origin", async () => {
    const response = await handle(
      async () => ok({ a: 1 }),
      ["https://a.app"],
    )({
      request: from("https://evil.app"),
      params: {},
    });
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
