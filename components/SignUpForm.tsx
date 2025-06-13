"use client";

import { z } from "zod/v4";
import { toast } from "sonner";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";
import { signUpFormSchema, Verification } from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignInGoogleButton from "@/components/SignInGoogleButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

async function sendEmail(
  templateParams: {
    to_email: string;
    to_name: string;
  },
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>,
) {
  const verification = await onGenerateVerificationToken(
    templateParams.to_email,
  );
  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
    {
      ...templateParams,
      message: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verification?.value}`,
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
  );
}

export default function SignUpForm({
  onGenerateVerificationToken,
}: {
  onGenerateVerificationToken: (email: string) => Promise<Verification | null>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [honeyPot, setHoneyPot] = useState("");

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    if (honeyPot) return;
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.fullName,
        callbackURL: "/signin",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onResponse: () => {
          setIsLoading(false);
        },
        onSuccess: async () => {
          const templateParams = {
            to_email: values.email,
            to_name: values.fullName.split(" ")[0],
          };
          await sendEmail(templateParams, onGenerateVerificationToken);
          router.push("/signin");
          toast.success(
            "Account created successfully! A verification link has been sent to your email. Please check your inbox and verify your account before signing in.",
          );
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address");
          }
          toast.error(ctx.error.message);
        },
      },
    );
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    required
                    type="text"
                    disabled={isLoading}
                    placeholder="Enter your full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <label className="group flex items-center gap-2 rounded-xl border bg-foreground/10 text-sm focus-within:border-ring group-disabled:cursor-not-allowed group-disabled:opacity-50">
                    <Input
                      required
                      disabled={isLoading}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="border-0 bg-transparent shadow-none drop-shadow-none focus-visible:ring-0"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      ) : (
                        <Eye className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      )}
                    </Button>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="hidden">
            <label htmlFor="verify__name">Verify your name</label>
            <input
              type="text"
              id="verify__name"
              name="verify__name"
              onChange={(event) => setHoneyPot(event.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            Sign up
          </Button>
        </form>
      </Form>
      <SignInGoogleButton isLoading={isLoading} />
    </>
  );
}
