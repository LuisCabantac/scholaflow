import { z } from "zod";
import { readdirSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";

import {
  buildOpenApi,
  listRoutes,
  registerRoute,
  resetRoutes,
} from "@/server/api/openapi";

describe("buildOpenApi", () => {
  beforeEach(() => resetRoutes());

  it("documents a bearer route with security and its responses", () => {
    registerRoute({
      method: "GET",
      path: "/me",
      summary: "Current user",
      auth: "bearer",
      response: z.object({ id: z.string() }),
      errors: ["unauthorized"],
    });
    const doc = buildOpenApi() as {
      openapi: string;
      paths: Record<
        string,
        Record<
          string,
          { security?: unknown[]; responses: Record<string, unknown> }
        >
      >;
      components: { securitySchemes: Record<string, unknown> };
    };
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.paths["/me"].get.security).toEqual([{ bearerAuth: [] }]);
    expect(doc.paths["/me"].get.responses["200"]).toBeDefined();
    expect(doc.paths["/me"].get.responses["401"]).toBeDefined();
    expect(doc.components.securitySchemes.bearerAuth).toBeDefined();
  });

  it("documents a public route without security and with a request body", () => {
    registerRoute({
      method: "POST",
      path: "/auth/password-reset",
      summary: "Request a reset",
      auth: "none",
      status: 202,
      request: z.object({ email: z.email() }),
      response: z.object({ ok: z.literal(true) }),
      errors: ["validation_failed", "not_found"],
    });
    const doc = buildOpenApi() as {
      paths: Record<
        string,
        Record<
          string,
          {
            security?: unknown;
            requestBody?: unknown;
            responses: Record<string, unknown>;
          }
        >
      >;
    };
    const op = doc.paths["/auth/password-reset"].post;
    expect(op.security).toBeUndefined();
    expect(op.requestBody).toBeDefined();
    expect(Object.keys(op.responses).sort()).toEqual(
      ["202", "400", "404"].sort(),
    );
  });

  it("emits 3.1 schemas where nullable fields allow null", () => {
    registerRoute({
      method: "GET",
      path: "/me",
      summary: "Current user",
      auth: "bearer",
      response: z.object({ image: z.string().nullable() }),
      errors: [],
    });
    const doc = buildOpenApi() as {
      paths: Record<
        string,
        Record<
          string,
          {
            responses: Record<
              string,
              {
                content: Record<
                  string,
                  { schema: { properties: Record<string, unknown> } }
                >;
              }
            >;
          }
        >
      >;
    };
    const image = JSON.stringify(
      doc.paths["/me"].get.responses["200"].content["application/json"].schema
        .properties.image,
    );
    expect(image).toContain('"null"');
    expect(image).not.toContain("nullable");
  });

  it("lists registered routes", () => {
    registerRoute({
      method: "GET",
      path: "/health",
      summary: "Health",
      auth: "none",
      response: z.object({ status: z.string() }),
      errors: [],
    });
    expect(listRoutes().map((r) => r.path)).toEqual(["/health"]);
  });
});

describe("route files and the registry agree", () => {
  it("every file under src/routes/api/v1 is registered and vice versa", async () => {
    resetRoutes();
    await import("@/server/api/routes");
    const files = readdirSync("src/routes/api/v1", { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".ts"))
      .map(
        (f) =>
          `/${f}`
            .replace(/\.ts$/, "")
            .replace(/\[\.\]/g, ".")
            .replace(/\$(\w+)/g, "{$1}")
            .replace(/\/index$/, "") || "/",
      );
    const registered = [...new Set(listRoutes().map((r) => r.path))];
    expect(files.sort()).toEqual(registered.sort());
  });
});
