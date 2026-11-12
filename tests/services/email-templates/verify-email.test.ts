import { describe, expect, it } from "vitest";

import { renderVerifyEmail } from "@/services/email-templates/verify-email";

const params = {
  toName: "Luis",
  verifyUrl: "https://example.test/verify?token=abc-123",
};

describe("renderVerifyEmail", () => {
  it("links to the verify url in html and text", () => {
    const email = renderVerifyEmail(params);
    expect(email.html).toContain(`href="${params.verifyUrl}"`);
    expect(email.text).toContain(params.verifyUrl);
  });

  it("greets the recipient by first name", () => {
    expect(renderVerifyEmail(params).html).toContain("Luis");
  });

  it("uses the pinned subject", () => {
    expect(renderVerifyEmail(params).subject).toBe(
      "Verify your ScholaFlow email",
    );
  });

  it("escapes html in the name", () => {
    const email = renderVerifyEmail({ ...params, toName: "<b>x</b>" });
    expect(email.html).not.toContain("<b>x</b>");
    expect(email.html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });

  it("tells uninvited recipients to ignore it and repeats the link as text", () => {
    const email = renderVerifyEmail(params);

    expect(email.html).toContain("you can safely ignore this email");
    expect(email.html).toContain("This link will expire in 1 day.");
    expect(email.html.split(params.verifyUrl).length).toBeGreaterThan(2);
    expect(email.text).toContain("you can safely ignore this email");
  });
});
