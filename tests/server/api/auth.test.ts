import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { readBearer, requireApiUser } from "@/server/api/auth";

const { getSession, verifyJWT, getUserByUserId } = vi.hoisted(() => ({
  getSession: vi.fn(),
  verifyJWT: vi.fn(),
  getUserByUserId: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession, verifyJWT } } }));
vi.mock("@/services/user", () => ({ getUserByUserId }));

const withAuth = (value: string) =>
  new Request("http://localhost/api/v1/me", {
    headers: { authorization: value },
  });

describe("readBearer", () => {
  it("returns the token of a bearer header", () => {
    expect(readBearer(withAuth("Bearer abc"))).toBe("abc");
  });

  it("accepts a lowercase scheme", () => {
    expect(readBearer(withAuth("bearer abc"))).toBe("abc");
  });

  it("returns null without a header, for another scheme, or an empty token", () => {
    expect(readBearer(new Request("http://localhost/api/v1/me"))).toBeNull();
    expect(readBearer(withAuth("Basic xyz"))).toBeNull();
    expect(readBearer(withAuth("Bearer"))).toBeNull();
    expect(readBearer(withAuth("Bearer   "))).toBeNull();
  });
});

describe("requireApiUser", () => {
  beforeEach(() => {
    getSession.mockReset();
    verifyJWT.mockReset();
    getUserByUserId.mockReset();
  });

  it("rejects a request without a bearer token", async () => {
    await expect(
      requireApiUser(new Request("http://localhost/api/v1/me")),
    ).rejects.toMatchObject({
      code: "unauthorized",
      message: "Authentication required.",
    });
    expect(getSession).not.toHaveBeenCalled();
  });

  it("returns the session user for a session token", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const user = await requireApiUser(withAuth("Bearer tok"));
    expect(user.id).toBe("u1");
    const headers = getSession.mock.calls[0][0].headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer tok");
  });

  it("falls back to a verified jwt and loads its subject", async () => {
    getSession.mockResolvedValue(null);
    verifyJWT.mockResolvedValue({ payload: { sub: "u2" } });
    getUserByUserId.mockResolvedValue({
      id: "u2",
      name: "Two",
      email: "two@x.io",
      image: null,
      role: "user",
      schoolName: null,
      emailVerified: true,
    });
    const user = await requireApiUser(withAuth("Bearer jwt"));
    expect(user.id).toBe("u2");
    expect(verifyJWT).toHaveBeenCalledWith({ body: { token: "jwt" } });
  });

  it("rejects when the jwt is invalid", async () => {
    getSession.mockResolvedValue(null);
    verifyJWT.mockRejectedValue(new Error("bad signature"));
    await expect(requireApiUser(withAuth("Bearer jwt"))).rejects.toMatchObject({
      code: "unauthorized",
      message: "Invalid or expired token.",
    });
  });

  it("rejects when the jwt subject no longer exists", async () => {
    getSession.mockResolvedValue(null);
    verifyJWT.mockResolvedValue({ payload: { sub: "gone" } });
    getUserByUserId.mockResolvedValue(null);
    await expect(requireApiUser(withAuth("Bearer jwt"))).rejects.toMatchObject({
      code: "unauthorized",
    });
  });

  it("passes only the bearer header to the session lookup, never cookies", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const request = new Request("http://localhost/api/v1/me", {
      headers: {
        authorization: "Bearer tok",
        cookie: "better-auth.session_token=stolen",
      },
    });
    await requireApiUser(request);
    const headers = getSession.mock.calls[0][0].headers as Headers;
    expect(headers.get("cookie")).toBeNull();
    expect(headers.get("authorization")).toBe("Bearer tok");
  });

  it("treats a better-auth api error from the session lookup as unauthorized", async () => {
    getSession.mockRejectedValue(
      new APIError("UNAUTHORIZED", { message: "bad" }),
    );
    await expect(requireApiUser(withAuth("Bearer tok"))).rejects.toMatchObject({
      code: "unauthorized",
    });
  });

  it("lets an infrastructure failure in the session lookup propagate", async () => {
    getSession.mockRejectedValue(new Error("db down"));
    await expect(requireApiUser(withAuth("Bearer tok"))).rejects.toThrow(
      "db down",
    );
  });

  it("lets an infrastructure failure in the user lookup propagate", async () => {
    getSession.mockResolvedValue(null);
    verifyJWT.mockResolvedValue({ payload: { sub: "u2" } });
    getUserByUserId.mockRejectedValue(new Error("db down"));
    await expect(requireApiUser(withAuth("Bearer jwt"))).rejects.toThrow(
      "db down",
    );
  });
});
