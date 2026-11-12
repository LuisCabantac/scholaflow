import { afterEach, describe, expect, it } from "vitest";

import {
  defaultAvatarUrl,
  isDefaultAvatarUrl,
  isUploadedAvatarUrl,
  resolveAvatarSrc,
} from "@/lib/default-avatar";

describe("defaultAvatarUrl", () => {
  const original = process.env.VITE_SUPABASE_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.VITE_SUPABASE_URL;
    else process.env.VITE_SUPABASE_URL = original;
  });

  it("points at default-avatar.jpg in the public avatars bucket", () => {
    process.env.VITE_SUPABASE_URL = "https://proj.supabase.co";
    expect(defaultAvatarUrl()).toBe(
      "https://proj.supabase.co/storage/v1/object/public/avatars/default-avatar.jpg",
    );
  });

  it("tolerates a trailing slash on the project url", () => {
    process.env.VITE_SUPABASE_URL = "https://proj.supabase.co/";
    expect(defaultAvatarUrl()).toBe(
      "https://proj.supabase.co/storage/v1/object/public/avatars/default-avatar.jpg",
    );
  });

  it("throws when the project url is unset", () => {
    delete process.env.VITE_SUPABASE_URL;
    expect(() => defaultAvatarUrl()).toThrow();
  });
});

describe("isDefaultAvatarUrl", () => {
  it("matches the bucket default with or without a double slash", () => {
    expect(
      isDefaultAvatarUrl(
        "https://proj.supabase.co/storage/v1/object/public/avatars/default-avatar.jpg",
      ),
    ).toBe(true);
    expect(
      isDefaultAvatarUrl(
        "https://proj.supabase.co/storage/v1/object/public/avatars//default-avatar.jpg",
      ),
    ).toBe(true);
  });

  it("does not match user uploads or google avatars", () => {
    expect(
      isDefaultAvatarUrl(
        "https://proj.supabase.co/storage/v1/object/public/avatars/uid/f1_abc.jpg",
      ),
    ).toBe(false);
    expect(isDefaultAvatarUrl("https://lh3.googleusercontent.com/a/x")).toBe(
      false,
    );
    expect(isDefaultAvatarUrl(null)).toBe(false);
  });
});

describe("isUploadedAvatarUrl", () => {
  it("is true only for user-uploaded bucket files", () => {
    expect(
      isUploadedAvatarUrl(
        "https://proj.supabase.co/storage/v1/object/public/avatars/uid/f1_abc.jpg",
      ),
    ).toBe(true);
    expect(
      isUploadedAvatarUrl(
        "https://proj.supabase.co/storage/v1/object/public/avatars//default-avatar.jpg",
      ),
    ).toBe(false);
    expect(isUploadedAvatarUrl("https://lh3.googleusercontent.com/a/x")).toBe(
      false,
    );
    expect(isUploadedAvatarUrl("")).toBe(false);
    expect(isUploadedAvatarUrl(undefined)).toBe(false);
  });
});

describe("resolveAvatarSrc", () => {
  const uploaded =
    "https://proj.supabase.co/storage/v1/object/public/avatars/u/a.jpg";

  it("keeps a real avatar url", () => {
    expect(resolveAvatarSrc(uploaded)).toBe(uploaded);
  });

  it("returns null (fallback) for empty, null and undefined", () => {
    expect(resolveAvatarSrc("")).toBeNull();
    expect(resolveAvatarSrc(null)).toBeNull();
    expect(resolveAvatarSrc(undefined)).toBeNull();
  });

  it("returns null for the bucket's default avatar url", () => {
    expect(
      resolveAvatarSrc(
        "https://proj.supabase.co/storage/v1/object/public/avatars//default-avatar.jpg",
      ),
    ).toBeNull();
  });

  it("returns null once the url is known to have failed to load", () => {
    expect(resolveAvatarSrc(uploaded, uploaded)).toBeNull();
    expect(resolveAvatarSrc(uploaded, "other")).toBe(uploaded);
  });
});
