import { createTransport } from "nodemailer";

type Transporter = ReturnType<typeof createTransport>;

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP_EMAIL and SMTP_PASSWORD must be set");
  }

  const port = Number(process.env.SMTP_PORT ?? 465);

  transporter = createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const from =
    process.env.SMTP_FROM ?? `ScholaFlow <${process.env.SMTP_EMAIL}>`;

  await getTransporter().sendMail({ from, ...input });
}
