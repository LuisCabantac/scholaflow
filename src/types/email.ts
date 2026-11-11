export type RenderedEmail = { subject: string; html: string; text: string };

export type VerifyEmailParams = { toName: string; verifyUrl: string };

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
