import { escapeHtml } from "@/services/email-templates/escape-html";
import {
  actionButton,
  type RenderedEmail,
  wrapEmailHtml,
} from "@/services/email-templates/layout";

export type ActionEmailParams = {
  toName: string;
  subject: string;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  actionUrl: string;
  footerMessage: string;
  warningMessage?: string;
};

export function renderActionEmail(params: ActionEmailParams): RenderedEmail {
  const name = escapeHtml(params.toName);
  const url = escapeHtml(params.actionUrl);
  const warning = params.warningMessage
    ? `<p data-warning style="margin:0 0 12px;padding:12px;border-radius:12px;background:#fef2f2;color:#991b1b;">${escapeHtml(params.warningMessage)}</p>`
    : "";

  const body = `<h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(params.title)}</h1>
<p style="margin:0 0 12px;">Hi ${name},</p>
<p style="margin:0 0 12px;">${escapeHtml(params.description)}</p>
${warning}
${actionButton(url, escapeHtml(params.buttonText), params.buttonColor)}
<p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button does not work, copy this link into your browser:<br /><a href="${url}" style="color:#5b7cf0;">${url}</a></p>
<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(params.footerMessage)}</p>`;

  const text = [
    `Hi ${params.toName},`,
    "",
    params.title,
    params.description,
    ...(params.warningMessage ? ["", params.warningMessage] : []),
    "",
    `${params.buttonText}: ${params.actionUrl}`,
    "",
    params.footerMessage,
  ].join("\n");

  return {
    subject: params.subject,
    html: wrapEmailHtml(params.subject, body),
    text,
  };
}
