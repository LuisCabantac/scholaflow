import { describe, expect, it } from "vitest";

import {
  AVATAR_ACCEPT,
  isAvatarFile,
  joinedDate,
  MAX_AVATAR_BYTES,
  isAvatarTooLarge,
  pickPasswordAccount,
  passwordChangeError,
} from "@/lib/profile-form";

const validChange = {
  currentPassword: "old-password",
  newPassword: "new-password",
  confirmNewPassword: "new-password",
};

describe("avatar rules", () => {
  it("caps the avatar at 4 MB", () => {
    expect(MAX_AVATAR_BYTES).toBe(4 * 1024 * 1024);
    expect(isAvatarTooLarge({ size: MAX_AVATAR_BYTES })).toBe(false);
    expect(isAvatarTooLarge({ size: MAX_AVATAR_BYTES + 1 })).toBe(true);
  });

  it("accepts only non-empty image files", () => {
    expect(isAvatarFile({ type: "image/png", size: 10 })).toBe(true);
    expect(isAvatarFile({ type: "image/svg+xml", size: 10 })).toBe(true);
    expect(isAvatarFile({ type: "application/pdf", size: 10 })).toBe(false);
    expect(isAvatarFile({ type: "image/png", size: 0 })).toBe(false);
  });

  it("lists main's accepted mime types", () => {
    expect(AVATAR_ACCEPT.split(",")).toEqual([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]);
  });
});

describe("passwordChangeError", () => {
  it("is null when no new password is given", () => {
    expect(
      passwordChangeError(
        { currentPassword: "", newPassword: "", confirmNewPassword: "typo" },
        "credential",
      ),
    ).toBeNull();
  });

  it("flags a confirmation that differs", () => {
    expect(
      passwordChangeError(
        { ...validChange, confirmNewPassword: "other-password" },
        "credential",
      ),
    ).toBe("mismatch");
  });

  it("enforces the 8 to 20 character range", () => {
    expect(
      passwordChangeError(
        {
          ...validChange,
          newPassword: "1234567",
          confirmNewPassword: "1234567",
        },
        "credential",
      ),
    ).toBe("tooShort");
    expect(
      passwordChangeError(
        {
          ...validChange,
          newPassword: "123456789012345678901",
          confirmNewPassword: "123456789012345678901",
        },
        "credential",
      ),
    ).toBe("tooLong");
  });

  it("requires the current password only for credential accounts", () => {
    expect(
      passwordChangeError(
        { ...validChange, currentPassword: "" },
        "credential",
      ),
    ).toBe("currentRequired");
    expect(
      passwordChangeError({ ...validChange, currentPassword: "" }, "google"),
    ).toBeNull();
  });

  it("is null for a valid credential change", () => {
    expect(passwordChangeError(validChange, "credential")).toBeNull();
  });
});

describe("pickPasswordAccount", () => {
  it("prefers the credential account regardless of order", () => {
    const google = { providerId: "google" };
    const credential = { providerId: "credential" };
    expect(pickPasswordAccount([google, credential])).toBe(credential);
    expect(pickPasswordAccount([credential, google])).toBe(credential);
  });

  it("falls back to the only account or null", () => {
    const google = { providerId: "google" };
    expect(pickPasswordAccount([google])).toBe(google);
    expect(pickPasswordAccount([])).toBeNull();
  });
});

describe("joinedDate", () => {
  it("formats the join date as a long month, day and year", () => {
    expect(joinedDate("2025-06-07T16:48:14.272Z")).toMatch(
      /^June 0[78], 2025$/,
    );
    expect(joinedDate(new Date(2024, 0, 5))).toBe("January 05, 2024");
  });
});
