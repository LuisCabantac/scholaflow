"use client";

import { z } from "zod/v4";
import Link from "next/link";
import { toast } from "sonner";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";
import { signInFormSchema } from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SignInGoogleButton from "@/components/SignInGoogleButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [honeyPot, setHoneyPot] = useState("");

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    if (honeyPot) return;
    setShowPassword(false);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/classroom",
        rememberMe,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onResponse: () => {
          setIsLoading(false);
        },
        onSuccess: () => {
          toast.success("Successfully signed in!");
        },
        onError: (ctx) => {
          if (ctx.error.status === 401) {
            toast.error("Invalid email or password. Please try again.");
            return;
          }
          if (ctx.error.status === 403) {
            toast.error(
              "Please verify your email address before signing in. Check your inbox for a verification link.",
            );
            return;
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

  function handleToggleRememberMe() {
    setRememberMe(!rememberMe);
  }

  return (
    <>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  disabled={isLoading}
                  checked={rememberMe}
                  onCheckedChange={handleToggleRememberMe}
                />
                Remember me
              </label>
            </div>
            <Button
              asChild
              variant="ghost"
              className="p-0 hover:bg-transparent"
            >
              <Link
                href="/forget-password"
                aria-disabled={isLoading}
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                Forget Password?
              </Link>
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            Sign in
          </Button>
        </form>
      </Form>
      <SignInGoogleButton isLoading={isLoading} />
    </>
  );
}
