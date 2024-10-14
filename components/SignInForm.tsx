"use client";

import { useState } from "react";

import { signInCredentialsAction } from "@/lib/auth-actions";

import SignInSignUpButton from "@/components/SignInSignUpButton";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  async function handleSignInAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const data = await signInCredentialsAction(formData);
    setError(data ?? false);
    setIsLoading(false);
  }

  return (
    <form className="grid gap-3" onSubmit={handleSignInAction}>
      <div className="grid gap-2">
        <label className="font-medium">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          required
          disabled={isLoading}
          name="email"
          type="email"
          placeholder="Enter your email"
          className={`rounded-md border-2 bg-[#edf2ff] px-4 py-2 focus:outline-2 focus:outline-[#384689] ${validEmail && !error ? "" : "border-[#f03e3e]"}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValidEmail(emailRegex.test(event.target.value))
          }
        />
      </div>
      <div className="mb-2 grid gap-2">
        <label className="font-medium">
          Password <span className="text-red-400">*</span>
        </label>
        <input
          required
          disabled={isLoading}
          name="password"
          type="password"
          placeholder="Enter your password"
          className={`rounded-md border-2 bg-[#edf2ff] px-4 py-2 focus:outline-2 focus:outline-[#384689] ${validPassword && !error ? "" : "border-[#f03e3e]"}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValidPassword(event.target.value.length >= 8 ? true : false)
          }
        />
        {error ? (
          <p className="text-xs text-[#f03e3e]">
            Your password is incorrect or this account doesn&apos;t exist.
            Please check your password or sign up. If you have an account try to
            sign in with google and add/change your password.
          </p>
        ) : null}
      </div>

      <SignInSignUpButton isLoading={isLoading}>Sign in</SignInSignUpButton>
    </form>
  );
}
