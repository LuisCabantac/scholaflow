"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { useRouter } from "next/navigation";

import { nanoidId, User, Verification } from "@/lib/schema";

import SpinnerMini from "@/components/SpinnerMini";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function sendEmail(
  formData: FormData,
  onGetUserByEmail: (email: string) => Promise<User | null>,
  onGetVerificationToken: (email: string) => Promise<Verification | null>,
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>,
) {
  const email = formData.get("email") as string | null;

  if (!email)
    return {
      success: false,
      message:
        "Email address is required. Please provide a valid email address.",
    };

  const existingToken = await onGetVerificationToken(email);

  if (existingToken && nanoidId.safeParse(existingToken.value).success) {
    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (!hasExpired) {
      return {
        success: false,
        message:
          "A verification email was already sent. Please check your inbox or wait for the current link to expire before requesting a new one.",
      };
    }
  }

  const existingUser = await onGetUserByEmail(email);

  if (!existingUser)
    return {
      success: false,
      message:
        "The email address you entered does not exist in our system. Please check your email and try again, or create a new account.",
    };

  const verification = await onGenerateVerificationToken(email);

  if (!verification) {
    return {
      success: false,
      message:
        "Failed to generate verification token. Please try again later or contact support if the issue persists.",
    };
  }

  const templateParams = {
    to_email: existingUser.email,
    to_name: existingUser.name.split(" ")[0],
    email_subject: "Reset Your ScholaFlow Password",
    email_title: "Password Reset Request",
    email_description:
      "We received a request to reset your ScholaFlow account password. If this was you, please click the button below to reset your password:",
    button_color: "#2563eb",
    button_text: "Reset Password",
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${verification.value}`,
    footer_message:
      "If you didn't request this password reset, please ignore this email or contact our support team. This link will expire in 1 day.",
  };

  await emailjs
    .send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_CLOSE_ACCOUNT_TEMPLATE_ID!,
      {
        ...templateParams,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
    )
    .then(() => {
      return {
        success: false,
        message:
          "Failed to send verification email. Please check your internet connection and try again, or contact support if the issue persists.",
      };
    })
    .catch(() => {
      return {
        success: false,
        message:
          "Failed to send verification email. Please check your internet connection and try again, or contact support if the issue persists.",
      };
    });

  return {
    success: true,
    message: "Verification email sent successfully. Please check your inbox.",
  };
}

export default function ForgetPasswordSection({
  onGetUserByEmail,
  onGetVerificationToken,
  onGenerateVerificationToken,
}: {
  onGetUserByEmail: (email: string) => Promise<User | null>;
  onGetVerificationToken: (email: string) => Promise<Verification | null>;
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(true);

  async function handleForgetPasswordAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await sendEmail(
      formData,
      onGetUserByEmail,
      onGetVerificationToken,
      onGenerateVerificationToken,
    );
    if (success) {
      router.push("/signin");
      toast.success(message);
    } else {
      toast.error(message);
    }
    setIsLoading(false);
  }

  return (
    <form className="grid gap-3 pb-3" onSubmit={handleForgetPasswordAction}>
      <div className="grid gap-2">
        <label className="font-medium">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          required
          disabled={isLoading}
          name="email"
          type="email"
          placeholder="Enter your email address"
          className={`rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${!validEmail && "border-[#f03e3e]"}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValidEmail(emailRegex.test(event.target.value))
          }
        />
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22317c] px-4 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#1b2763] disabled:text-[#d5dae6]"
          disabled={isLoading}
          type="submit"
        >
          {isLoading && <SpinnerMini />}
          Reset Password
        </button>
      </div>
    </form>
  );
}
