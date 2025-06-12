"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CircleCheck, CircleX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { uuidv4Id } from "@/lib/schema";
import { closeUserAccount } from "@/lib/auth-actions";

import { Button } from "@/components/ui/button";

export default function CloseAccountSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  if (!token) {
    router.push("/");
  }

  if (uuidv4Id.safeParse(token).error) {
    router.push("/");
  }

  async function confirmDeleteAccountAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const { success, message } = await closeUserAccount(token ?? "");

    setSuccess(success);
    setMessage(message);
    setIsLoading(false);
    if (success) {
      toast.success(message);
      router.push("/signin");
    } else {
      toast.error(message);
    }
  }

  return (
    <form className="grid gap-3 pb-3" onSubmit={confirmDeleteAccountAction}>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Closing account..." : "Permanently close account"}
      </Button>
    </form>
  );
}
