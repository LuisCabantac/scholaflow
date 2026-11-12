import { describe, expect, it } from "vitest";

import { ApiError } from "@/server/api/errors";
import { fail, handle, noContent, ok } from "@/server/api/respond";

const ctx = (init?: RequestInit) => ({
  request: new Request("http://localhost/api/v1/x", init),
  params: {},
});

describe("ok", () => {
  it("returns a json response with status 200 by default", async () => {
    const response = ok({ a: 1 });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await response.json()).toEqual({ a: 1 });
  });

  it("accepts a status", () => {
    expect(ok({ id: "x" }, 201).status).toBe(201);
  });
});

describe("noContent", () => {
  it("returns 204 with an empty body", async () => {
    const response = noContent();
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});

describe("fail", () => {
  it("renders an ApiError with its status and envelope", async () => {
    const response = fail(new ApiError("not_found", "Class not found"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "Class not found" },
    });
  });

  it("hides unknown errors as internal", async () => {
    const response = fail(new Error("boom"));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("internal");
    expect(JSON.stringify(body)).not.toContain("boom");
  });

  it("includes details for validation failures", async () => {
    const response = fail(
      new ApiError("validation_failed", "Invalid request body.", [
        { path: ["name"] },
      ]),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.details).toEqual([{ path: ["name"] }]);
  });
});

describe("handle", () => {
  it("returns the handler's response", async () => {
    const response = await handle(async () => ok({ fine: true }))(ctx());
    expect(response.status).toBe(200);
  });

  it("turns a thrown error into a failure response", async () => {
    const response = await handle(async () => {
      throw new ApiError("forbidden", "Teachers only.");
    })(ctx());
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("forbidden");
  });
});
