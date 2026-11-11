import { afterEach, describe, expect, it } from "vitest";

import { defaultAvatarUrl } from "@/lib/default-avatar";

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
