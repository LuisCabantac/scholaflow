import { z } from "zod";

import type { ApiErrorCode } from "@/types/api";
import { API_ERROR_STATUS } from "@/server/api/errors";

export type RouteDoc = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  summary: string;
  auth: "bearer" | "none";
  status?: number;
  request?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
  response: z.ZodType;
  errors: ApiErrorCode[];
};

const routes: RouteDoc[] = [];

const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export function registerRoute(doc: RouteDoc): void {
  routes.push(doc);
}

export function listRoutes(): RouteDoc[] {
  return [...routes];
}

export function resetRoutes(): void {
  routes.length = 0;
}

function schemaOf(schema: z.ZodType) {
  return z.toJSONSchema(schema);
}

function parameters(doc: RouteDoc) {
  const list: object[] = [];
  for (const [location, schema] of [
    ["path", doc.params],
    ["query", doc.query],
  ] as const) {
    if (!schema) continue;
    const json = schemaOf(schema) as {
      properties?: Record<string, unknown>;
      required?: string[];
    };
    for (const [name, property] of Object.entries(json.properties ?? {})) {
      list.push({
        name,
        in: location,
        required: location === "path" || json.required?.includes(name),
        schema: property,
      });
    }
  }
  return list;
}

function operation(doc: RouteDoc) {
  const responses: Record<string, unknown> = {
    [String(doc.status ?? 200)]: {
      description: "Success",
      content: { "application/json": { schema: schemaOf(doc.response) } },
    },
  };
  for (const code of doc.errors) {
    responses[String(API_ERROR_STATUS[code])] = {
      description: code,
      content: { "application/json": { schema: schemaOf(errorSchema) } },
    };
  }

  return {
    summary: doc.summary,
    ...(doc.auth === "bearer" ? { security: [{ bearerAuth: [] }] } : {}),
    ...(parameters(doc).length ? { parameters: parameters(doc) } : {}),
    ...(doc.request
      ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema: schemaOf(doc.request) } },
          },
        }
      : {}),
    responses,
  };
}

export function buildOpenApi(): object {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const doc of routes) {
    paths[doc.path] ??= {};
    paths[doc.path][doc.method.toLowerCase()] = operation(doc);
  }

  return {
    openapi: "3.1.0",
    info: { title: "ScholaFlow API", version: "1.0.0" },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
    paths,
  };
}
