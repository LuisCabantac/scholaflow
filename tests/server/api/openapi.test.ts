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

  it("documents date fields as date-time strings and lets responses carry extra fields", () => {
    registerRoute({
      method: "POST",
      path: "/things",
      summary: "Create",
      auth: "bearer",
      status: 201,
      request: z.object({ name: z.string(), note: z.string().default("") }),
      response: z.object({ id: z.string(), createdAt: z.date() }),
      errors: [],
    });
    const doc = buildOpenApi() as {
      paths: Record<
        string,
        Record<
          string,
          {
            requestBody: {
              content: Record<string, { schema: Record<string, unknown> }>;
            };
            responses: Record<
              string,
              {
                content: Record<
                  string,
                  {
                    schema: {
                      properties: Record<string, unknown>;
                      additionalProperties?: unknown;
                    };
                  }
                >;
              }
            >;
          }
        >
      >;
    };
    const op = doc.paths["/things"].post;
    const response = op.responses["201"].content["application/json"].schema;
    expect(response.properties.createdAt).toEqual({
      type: "string",
      format: "date-time",
    });
    expect(response.additionalProperties).toBeUndefined();
    const request = op.requestBody.content["application/json"].schema;
    expect(request.additionalProperties).toBeUndefined();
    expect(request.required ?? []).not.toContain("note");
  });

  it("documents a route with files as multipart form data in input mode", () => {
    registerRoute({
      method: "POST",
      path: "/streams",
      summary: "Create",
      auth: "bearer",
      status: 201,
      request: z
        .object({
          title: z.string().optional(),
          type: z.enum(["stream", "quiz"]).default("stream"),
        })
        .transform((form) => ({ ...form, done: true })),
      files: { attachments: "many", cover: "one" },
      response: z.object({ id: z.string() }),
      errors: ["validation_failed", "payload_too_large"],
    });
    const doc = buildOpenApi() as {
      paths: Record<
        string,
        Record<
          string,
          {
            requestBody: {
              content: Record<
                string,
                {
                  schema: {
                    properties: Record<string, unknown>;
                    required?: string[];
                  };
                }
              >;
            };
            responses: Record<string, unknown>;
          }
        >
      >;
    };
    const op = doc.paths["/streams"].post;
    expect(Object.keys(op.requestBody.content)).toEqual([
      "multipart/form-data",
    ]);
    const schema = op.requestBody.content["multipart/form-data"].schema;
    expect(schema.properties.attachments).toEqual({
      type: "array",
      items: { type: "string", format: "binary" },
    });
    expect(schema.properties.cover).toEqual({
      type: "string",
      format: "binary",
    });
    expect(schema.properties.title).toBeDefined();
    expect(schema.properties.done).toBeUndefined();
    expect(schema.required ?? []).not.toContain("type");
    expect(op.responses["413"]).toBeDefined();
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
