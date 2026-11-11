const logoUrl =
  "https://github.com/user-attachments/assets/bccbcc7a-c0df-40f5-b07c-72b5c874594e";

export function wrapEmailHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
<div style="max-width:600px;margin:0 auto;">
<div style="border: 1px solid #dddfe6; border-radius: 0.75rem; padding: 1rem; background: #f3f6ff; display: grid;">
<img style="width: 150px;" src="${logoUrl}" alt="ScholaFlow" />
${body}
</div>
</div>
</body>
</html>`;
}

export function actionButton(
  url: string,
  label: string,
  color: string,
  textColor = "#ffffff",
): string {
  return `<a style="display: inline-block; background-color: ${color}; color: ${textColor}; text-decoration: none; font-weight: 500; font-size: 16px; text-align: center; padding: 10px 20px; border-radius: 9999px; margin-top: 10px;" href="${url}">${label}</a>`;
}

export const signOff = `<p><span>Happy learning!</span></p>
<p><span>The ScholaFlow Team</span></p>`;
