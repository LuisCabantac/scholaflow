import { describe, expect, it } from "vitest";

import { renderActionEmail } from "@/services/email-templates/action-email";

const reset = {
  toName: "Luis",
  subject: "Reset Your ScholaFlow Password",
  title: "Password Reset Request",
  description:
    "We received a request to reset your ScholaFlow account password.",
  buttonText: "Reset Password",
  buttonColor: "#2563eb",
  actionUrl: "https://example.test/reset-password?token=nano_id",
  footerMessage:
    "If you didn't request this password reset, please ignore this email.",
};

describe("renderActionEmail", () => {
  it("renders the button with the action url and colour", () => {
    const email = renderActionEmail(reset);
    expect(email.html).toContain(`href="${reset.actionUrl}"`);
    expect(email.html).toContain("Reset Password");
    expect(email.html).toMatch(/style="[^"]*background(?:-color)?:\s*#2563eb/);
  });

  it("includes title, description, footer and the subject", () => {
    const email = renderActionEmail(reset);
    expect(email.subject).toBe(reset.subject);
    expect(email.html).toContain(reset.title);
    expect(email.html).toContain(reset.description);
    expect(email.html).toContain(reset.footerMessage);
    expect(email.text).toContain(reset.actionUrl);
  });

  it("omits the warning block unless a warning is given", () => {
    expect(renderActionEmail(reset).html).not.toContain("data-warning");
    const withWarning = renderActionEmail({
      ...reset,
      warningMessage: "This action cannot be <undone>.",
    });
    expect(withWarning.html).toContain("data-warning");
    expect(withWarning.html).toContain("&lt;undone&gt;");
  });
});
