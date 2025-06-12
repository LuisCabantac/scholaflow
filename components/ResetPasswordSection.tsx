"use client";

import { z } from "zod/v4";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { updateUserPassword } from "@/lib/auth-actions";
import { nanoidId, resetPasswordFormSchema } from "@/lib/schema";

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

export default function ResetPasswordSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");

  if (!token) router.push("/");

  const tokenResult = nanoidId.safeParse(token);

  if (tokenResult.error) router.back();

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    setIsLoading(true);
    if (tokenResult.success) {
      const { success, message } = await updateUserPassword(
        tokenResult.data,
        values,
      );
      if (success) {
        router.push("/signin");
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
    setIsLoading(false);
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    className="border-0 shadow-none drop-shadow-none focus-visible:ring-0"
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
