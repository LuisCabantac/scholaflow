export type RenderedEmail = { subject: string; html: string; text: string };

export function wrapEmailHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:24px;background:#f5f7fb;font-family:'Be Vietnam Pro',Arial,sans-serif;color:#111827;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
<p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#5b7cf0;">ScholaFlow</p>
${body}
</div>
</body>
</html>`;
}

export function actionButton(
  url: string,
  label: string,
  color: string,
): string {
  return `<p style="text-align:center;margin:28px 0;"><a href="${url}" style="display:inline-block;padding:12px 24px;border-radius:12px;background:${color};color:#ffffff;text-decoration:none;font-weight:600;">${label}</a></p>`;
}
