import { z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/server/api/errors";
import {
  MAX_UPLOAD_BYTES,
  parseForm,
  parseJson,
  parseParams,
  parseQuery,
  readMultipart,
} from "@/server/api/parse";

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

describe("readMultipart", () => {
  const multipart = (form: FormData) =>
    new Request("http://localhost/api/v1/x", { method: "POST", body: form });
  const stub = (headers: Record<string, string>) => {
    const formData = vi.fn();
    return {
      request: {
        headers: new Headers(headers),
        formData,
      } as unknown as Request,
      formData,
    };
  };

  it("refuses a json body", async () => {
    await expect(readMultipart(json("{}"))).rejects.toMatchObject({
      code: "validation_failed",
      message: "Expected multipart/form-data.",
    });
  });

  it("refuses an oversized content-length before reading the body", async () => {
    const { request, formData } = stub({
      "content-type": "multipart/form-data; boundary=x",
      "content-length": String(MAX_UPLOAD_BYTES + 300 * 1024),
    });
    await expect(readMultipart(request)).rejects.toMatchObject({
      code: "payload_too_large",
      message: "Uploads are limited to 4 MB per request.",
    });
    expect(formData).not.toHaveBeenCalled();
  });

  it("refuses files that add up to more than the cap", async () => {
    const big = new Uint8Array(2.5 * 1024 * 1024);
    const form = new FormData();
    form.append("attachments", new File([big], "a.bin"));
    form.append("attachments", new File([big], "b.bin"));
    const { request } = stub({
      "content-type": "multipart/form-data; boundary=x",
      "content-length": "100",
    });
    (request.formData as ReturnType<typeof vi.fn>).mockResolvedValue(form);
    await expect(readMultipart(request)).rejects.toMatchObject({
      code: "payload_too_large",
    });
  });

  it("is a validation failure when the body cannot be read", async () => {
    const { request } = stub({
      "content-type": "multipart/form-data; boundary=x",
    });
    (request.formData as ReturnType<typeof vi.fn>).mockRejectedValue(
      new TypeError("bad"),
    );
    await expect(readMultipart(request)).rejects.toMatchObject({
      code: "validation_failed",
      message: "Invalid request body.",
    });
  });

  it("returns the entries of a valid form", async () => {
    const form = new FormData();
    form.append("title", "Hello");
    form.append("attachments", new File(["hi"], "a.txt"));
    const data = await readMultipart(multipart(form));
    expect(data.get("title")).toBe("Hello");
    expect((data.get("attachments") as File).name).toBe("a.txt");
  });
});

describe("parseForm", () => {
  const listSchema = z.object({
    title: z.string().optional(),
    announceTo: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
  });

  it("keeps a list key sent once with an empty value as an empty list", () => {
    const form = new FormData();
    form.append("announceTo", "");
    expect(parseForm(form, listSchema, ["announceTo", "links"])).toEqual({
      announceTo: [],
    });
  });

  it("keeps repeated list values in order and the last value of other keys", () => {
    const form = new FormData();
    form.append("links", "https://a.test");
    form.append("links", "https://b.test");
    form.append("title", "one");
    form.append("title", "two");
    expect(parseForm(form, listSchema, ["links"])).toEqual({
      links: ["https://a.test", "https://b.test"],
      title: "two",
    });
  });

  it("leaves files out of the record", () => {
    const form = new FormData();
    form.append("attachments", new File(["x"], "a.txt"));
    form.append("title", "t");
    const seen = vi.fn((value: unknown) => value);
    parseForm(form, z.unknown().transform(seen));
    expect(seen.mock.calls[0][0]).toEqual({ title: "t" });
  });

  it("reports schema failures as validation_failed with the issues", () => {
    const form = new FormData();
    form.append("points", "abc");
    const error = (() => {
      try {
        parseForm(form, z.object({ points: z.string().regex(/^\d+$/) }));
      } catch (e) {
        return e as ApiError;
      }
    })();
    expect(error).toBeInstanceOf(ApiError);
    expect(error?.code).toBe("validation_failed");
    expect(error?.message).toBe("Invalid request body.");
    expect(Array.isArray(error?.details)).toBe(true);
  });
});
