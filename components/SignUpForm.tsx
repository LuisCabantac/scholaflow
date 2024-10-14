"use client";

import { useState } from "react";
import { checkEmail, checkVerificationToken } from "@/lib/auth-actions";
import SignInSignUpButton from "@/components/SignInSignUpButton";

const fullNameRegex =
  /^[A-Za-z]+([' -]?[A-Za-z]+)* [A-Za-z]+([' -]?[A-Za-z]+)*$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailExist, setEmailExist] = useState(false);
  const [validFullName, setValidFullName] = useState(true);
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  async function handleSignUpAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);

    const data = await checkEmail(formData);
    setIsLoading(false);
    setEmailVerificationSent(
      data.type === "verification" && data.success.status,
    );
    setEmailExist(data.type === "email" && !data.success.status);
    const verified = await checkVerificationToken(formData);
    console.log(verified);

    if (emailVerificationSent && verified) {
      // await signUpAction(formData);
    }
  }
  return (
    <form className="grid gap-y-3" onSubmit={handleSignUpAction}>
      <div className={`${!emailVerificationSent ? "block" : "hidden"}`}>
        <div className="grid gap-y-2">
          <label className="font-medium">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            required
            disabled={isLoading}
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            className={`rounded-md border-2 bg-[#fdfeff] px-5 py-3 focus:outline-none ${!validFullName ? "border-[#f03e3e]" : ""}`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValidFullName(fullNameRegex.test(event.target.value.trim()))
            }
          />
          {!validFullName ? (
            <p className="text-xs text-[#f03e3e]">Please enter a valid name.</p>
          ) : null}
        </div>
        <div className="grid gap-y-2">
          <label className="font-medium">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            required
            disabled={isLoading}
            name="email"
            type="email"
            placeholder="Enter your email"
            className={`rounded-md border-2 bg-[#fdfeff] px-5 py-3 focus:outline-none ${validEmail && !emailExist ? "" : "border-[#f03e3e]"}`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValidEmail(emailRegex.test(event.target.value))
            }
          />
          {emailExist ? (
            <p className="text-xs text-[#f03e3e]">
              This email has already been taken.
            </p>
          ) : null}
        </div>
        <div className="mb-2 grid gap-y-2">
          <label className="font-medium">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            required
            disabled={isLoading}
            name="password"
            type="password"
            placeholder="Create password"
            className={`rounded-md border-2 bg-[#fdfeff] px-5 py-3 focus:outline-none ${!validPassword ? "border-[#f03e3e]" : ""}`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValidPassword(event.target.value.length >= 8 ? true : false)
            }
          />
          {!validPassword ? (
            <p className="text-xs text-[#f03e3e]">
              Your password must be at least longer than 8 characters long.
            </p>
          ) : null}
        </div>
      </div>

      {emailVerificationSent && (
        <>
          <h3 className="text-xl font-medium">Verify your email address</h3>
          <input
            type="number"
            placeholder="00000"
            name="otp"
            className="px-5 py-3"
            required={emailVerificationSent}
          />
          <p className="flex items-center justify-center gap-2 rounded-md border-2 border-[#51cf66] bg-[#b2f2bb] p-1 text-sm font-medium text-[#51cf66]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5 stroke-[#51cf66]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            Email verification was sent.
          </p>
        </>
      )}

      <SignInSignUpButton isLoading={isLoading}>
        {emailVerificationSent ? "Sign up" : "Continue"}
      </SignInSignUpButton>
    </form>
  );
}
