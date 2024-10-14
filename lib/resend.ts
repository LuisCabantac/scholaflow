"use server";

import nodemailer from "nodemailer";
// const domain = "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.GMAIL_NODEMAILER_EMAIL}`,
    pass: `${process.env.GMAIL_NODEMAILER_PASSWORD}`,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  // const confirmationLink = `${domain}/verify-email/token=${token}`;

  const mailOptions = {
    from: process.env.GMAIL_NODEMAILER_EMAIL,
    to: email,
    subject: "Verify Your Email!",
    text: `Hello ${email}`,
    html: `<p>${token}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const domain = "http://localhost:3000";

// export async function sendVerificationEmail(email: string, token: string) {
//   const confirmationLink = `${domain}/verify-email/token=${token}`;

//   console.log(email, token);

//   await resend.emails.send({
//     from: "onboarding@resend.dev",
//     to: email,
//     subject: "Verify your email",
//     html: `<p>Click <a href="${confirmationLink}">here</a> to verify your email.</p>`,
//   });
// }
