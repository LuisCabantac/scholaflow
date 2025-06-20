"use client";

import React from "react";

import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";

export default function SignInGoogleButton({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signIn.social({
          provider: "google",
          callbackURL: "/classroom",
          errorCallbackURL: "/error",
        });
      }}
      disabled={isLoading}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-primary disabled:fill-primary/90"
      >
        <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
      </svg>
      Continue with Google
    </Button>
  );
}
