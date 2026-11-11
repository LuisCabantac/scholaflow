import { escapeHtml } from "@/services/email-templates/escape-html";
import {
  actionButton,
  type RenderedEmail,
  wrapEmailHtml,
} from "@/services/email-templates/layout";

export type VerifyEmailParams = { toName: string; verifyUrl: string };

const subject = "Verify your ScholaFlow email";

export function renderVerifyEmail(params: VerifyEmailParams): RenderedEmail {
  const name = escapeHtml(params.toName);
  const url = escapeHtml(params.verifyUrl);

  const body = `<h1 style="margin:0 0 16px;font-size:20px;">Welcome to ScholaFlow</h1>
<p style="margin:0 0 12px;">Hi ${name},</p>
<p style="margin:0 0 12px;">Thanks for signing up. Please confirm your email address to activate your account.</p>
${actionButton(url, "Verify email", "#5b7cf0")}
<p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button does not work, copy this link into your browser:<br /><a href="${url}" style="color:#5b7cf0;">${url}</a></p>
<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">If you did not create a ScholaFlow account, you can ignore this email. This link expires in 1 day.</p>`;

  const text = [
    `Hi ${params.toName},`,
    "",
    "Thanks for signing up to ScholaFlow. Confirm your email address to activate your account:",
    params.verifyUrl,
    "",
    "If you did not create a ScholaFlow account, you can ignore this email. This link expires in 1 day.",
  ].join("\n");

  return { subject, html: wrapEmailHtml(subject, body), text };
}
