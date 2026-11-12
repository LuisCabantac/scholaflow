import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildAppUrl,
  isExpired,
  matchesTokenType,
  parseTokenIdentifier,
  tokenIdentifier,
} from "@/lib/auth-tokens";

describe("isExpired", () => {
  it("is true for a past date", () => {
    expect(isExpired("2000-01-01T00:00:00Z")).toBe(true);
  });

  it("is false for a future date", () => {
    expect(isExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it("compares against the provided now", () => {
    const now = new Date("2030-01-01T00:00:00Z");
    expect(isExpired("2029-12-31T23:59:59Z", now)).toBe(true);
    expect(isExpired("2030-01-01T00:00:01Z", now)).toBe(false);
  });
});

describe("matchesTokenType", () => {
  it("recognises uuid tokens", () => {
    const token = uuidv4();
    expect(matchesTokenType(token, "uuid")).toBe(true);
    expect(matchesTokenType(token, "nanoid")).toBe(false);
  });

  it("recognises nanoid tokens", () => {
    const token = nanoid();
    expect(matchesTokenType(token, "nanoid")).toBe(true);
    expect(matchesTokenType(token, "uuid")).toBe(false);
  });
});

describe("buildAppUrl", () => {
  const original = process.env.APP_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = original;
  });

  it("prefixes the path with APP_URL", () => {
    process.env.APP_URL = "http://localhost:3000";
    expect(buildAppUrl("/verify?token=x")).toBe(
      "http://localhost:3000/verify?token=x",
    );
  });

  it("drops a trailing slash on APP_URL", () => {
    process.env.APP_URL = "http://localhost:3000/";
    expect(buildAppUrl("/verify")).toBe("http://localhost:3000/verify");
  });

  it("throws when APP_URL is unset", () => {
    delete process.env.APP_URL;
    expect(() => buildAppUrl("/verify")).toThrow();
  });
});

describe("tokenIdentifier", () => {
  it("prefixes the email with the purpose", () => {
    expect(tokenIdentifier("verify", "a@b.co")).toBe("verify:a@b.co");
    expect(tokenIdentifier("reset", "a@b.co")).toBe("reset:a@b.co");
    expect(tokenIdentifier("close", "a@b.co")).toBe("close:a@b.co");
  });
});

describe("parseTokenIdentifier", () => {
  it("round-trips a namespaced identifier", () => {
    expect(parseTokenIdentifier(tokenIdentifier("close", "a@b.co"))).toEqual({
      purpose: "close",
      email: "a@b.co",
    });
  });

  it("keeps colons that belong to the email", () => {
    expect(parseTokenIdentifier("reset:odd:name@b.co")).toEqual({
      purpose: "reset",
      email: "odd:name@b.co",
    });
  });

  it("returns null for a legacy bare email", () => {
    expect(parseTokenIdentifier("a@b.co")).toBeNull();
  });

  it("returns null for an unknown prefix", () => {
    expect(parseTokenIdentifier("oauth:a@b.co")).toBeNull();
  });

  it("returns null for a namespaced identifier without an email", () => {
    expect(parseTokenIdentifier("verify:")).toBeNull();
  });
});
