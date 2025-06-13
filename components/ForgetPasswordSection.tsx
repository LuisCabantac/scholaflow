"use client";

import { z } from "zod/v4";
import { toast } from "sonner";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgetPasswordFormSchema } from "@/lib/schema";
import { checkVerificationToken } from "@/lib/auth-actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

async function sendEmail(email: string) {
  if (!email)
    return {
      success: false,
      message:
        "Email address is required. Please provide a valid email address.",
    };

  const { success, message, data, userName } = await checkVerificationToken(
    email,
    "nanoid",
  );

  if (!success) {
    return { success: false, message };
  }

  const templateParams = {
    to_email: email,
    to_name: userName?.split(" ")[0],
    email_subject: "Reset Your ScholaFlow Password",
    email_title: "Password Reset Request",
    email_description:
      "We received a request to reset your ScholaFlow account password. If this was you, please click the button below to reset your password:",
    button_color: "#2563eb",
    button_text: "Reset Password",
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data?.value}`,
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

export default function ForgetPasswordSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgetPasswordFormSchema>>({
    resolver: zodResolver(forgetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgetPasswordFormSchema>) {
    setIsLoading(true);
    const { success, message } = await sendEmail(values.email);
    if (success) {
      router.push("/signin");
      toast.success(message);
    } else {
      toast.error(message);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  required
                  type="email"
                  disabled={isLoading}
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
