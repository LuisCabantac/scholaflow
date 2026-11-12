import { z } from "zod";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/server/api/errors";
import { parseJson, parseParams, parseQuery } from "@/server/api/parse";

const json = (body: string) =>
  new Request("http://localhost/api/v1/x", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
const schema = z.object({ name: z.string(), points: z.number() });

describe("parseJson", () => {
  it("rejects a body that is not json", async () => {
    await expect(parseJson(json("not json"), schema)).rejects.toMatchObject({
      code: "validation_failed",
      message: "Invalid request body.",
    });
  });

  it("rejects a body that fails the schema and reports the issues", async () => {
    const error = await parseJson(
      json('{"name":"a","points":"x"}'),
      schema,
    ).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("validation_failed");
    expect(Array.isArray(error.details)).toBe(true);
  });

  it("returns the parsed body when valid", async () => {
    await expect(
      parseJson(json('{"name":"a","points":2}'), schema),
    ).resolves.toEqual({
      name: "a",
      points: 2,
    });
  });
});

describe("parseParams", () => {
  const params = z.object({ classId: z.uuidv4() });

  it("rejects invalid route parameters", () => {
    expect(() => parseParams({ classId: "x" }, params)).toThrowError(
      expect.objectContaining({
        code: "validation_failed",
        message: "Invalid route parameters.",
      }),
    );
  });

  it("returns valid parameters", () => {
    const id = "6dc6c587-a760-478e-8e7a-a3c76046847c";
    expect(parseParams({ classId: id }, params)).toEqual({ classId: id });
  });
});

describe("parseQuery", () => {
  const query = z.object({ query: z.string().default("") });

  it("reads search parameters", () => {
    expect(
      parseQuery(new Request("http://localhost/x?query=abc"), query),
    ).toEqual({
      query: "abc",
    });
  });

  it("applies defaults when a parameter is missing", () => {
    expect(parseQuery(new Request("http://localhost/x"), query)).toEqual({
      query: "",
    });
  });
});
