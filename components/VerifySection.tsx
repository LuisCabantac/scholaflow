"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyEmailVerification } from "@/lib/auth-actions";

import { Button } from "@/components/ui/button";
import SpinnerMini from "@/components/SpinnerMini";

export default function VerifySection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      router.push("/");
      return;
    }

    verifyEmailVerification(token ?? "").then((data) => {
      setIsLoading(false);
      setSuccess(data.success);
      setMessage(data.message);
      if (data.success) {
        setTimeout(() => router.push("/signin"), 2000);
      }
    });
  }, [token, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="grid gap-3 pb-3">
      {isLoading && (
        <div className="flex gap-2 rounded-xl border bg-card p-3 text-muted-foreground">
          <SpinnerMini />
          <span>Verifying...</span>
        </div>
      )}
      {success && (
        <div className="flex gap-2 rounded-xl border bg-card p-3 text-muted-foreground">
          <CircleCheck className="stroke-success h-6 w-6 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {success === false && success !== null && (
        <div className="flex gap-2 rounded-xl border bg-card p-3 text-muted-foreground">
          <CircleX className="h-6 w-6 flex-shrink-0 stroke-destructive" />
          <span>{message}</span>
        </div>
      )}
      {success === false && (
        <Button type="button" onClick={() => router.push("/")}>
          Go Back to Home
        </Button>
      )}
    </div>
  );
}
