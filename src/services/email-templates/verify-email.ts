import { escapeHtml } from "@/services/email-templates/escape-html";
import type { RenderedEmail, VerifyEmailParams } from "@/types/email";
import {
  actionButton,
  signOff,
  wrapEmailHtml,
} from "@/services/email-templates/layout";

const subject = "Verify your ScholaFlow email";

export function renderVerifyEmail(params: VerifyEmailParams): RenderedEmail {
  const name = escapeHtml(params.toName);
  const url = escapeHtml(params.verifyUrl);

  const body = `<h1>Thanks for signing up ${name}!</h1>
<p>You're almost there! Just one click to activate your ScholaFlow account and experience smarter, more engaging learning:</p>
${actionButton(url, "Verify email", "#22317c", "#edf2ff")}
${signOff}`;

  const text = [
    `Thanks for signing up ${params.toName}!`,
    "",
    "You're almost there! Just one click to activate your ScholaFlow account and experience smarter, more engaging learning:",
    params.verifyUrl,
    "",
    "Happy learning!",
    "The ScholaFlow Team",
  ].join("\n");

  return { subject, html: wrapEmailHtml(subject, body), text };
}
