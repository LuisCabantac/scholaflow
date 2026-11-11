import { escapeHtml } from "@/services/email-templates/escape-html";
import type { ActionEmailParams, RenderedEmail } from "@/types/email";
import {
  actionButton,
  signOff,
  wrapEmailHtml,
} from "@/services/email-templates/layout";

export function renderActionEmail(params: ActionEmailParams): RenderedEmail {
  const name = escapeHtml(params.toName);
  const url = escapeHtml(params.actionUrl);
  const warning = params.warningMessage
    ? `<p data-warning style="margin-top: 1rem; color: #dc2626; font-weight: 500;">⚠️ Warning: ${escapeHtml(params.warningMessage)}</p>`
    : "";

  const body = `<h1>${escapeHtml(params.title)}, ${name}</h1>
<p>${escapeHtml(params.description)}</p>
${actionButton(url, escapeHtml(params.buttonText), params.buttonColor)}
${warning}
<p>${escapeHtml(params.footerMessage)}</p>
${signOff}`;

  const text = [
    `${params.title}, ${params.toName}`,
    "",
    params.description,
    "",
    `${params.buttonText}: ${params.actionUrl}`,
    ...(params.warningMessage ? ["", `Warning: ${params.warningMessage}`] : []),
    "",
    params.footerMessage,
    "",
    "Happy learning!",
    "The ScholaFlow Team",
  ].join("\n");

  return {
    subject: params.subject,
    html: wrapEmailHtml(params.subject, body),
    text,
  };
}
