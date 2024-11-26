"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { signUpAction } from "@/lib/auth-actions";

import SignInCredentialsButton from "@/components/SignInCredentialsButton";

const fullNameRegex =
  /^[A-Za-z]+([' -]?[A-Za-z]+)* [A-Za-z]+([' -]?[A-Za-z]+)*$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [validFullName, setValidFullName] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [honeyPot, setHoneyPot] = useState("");

  async function handleSignUpAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    if (honeyPot) return;
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await signUpAction(formData);
    setIsLoading(false);
    if (success) {
      toast.success(message);
      router.push("/signin");
    } else toast.error(message);
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  return (
    <form className="grid gap-3" onSubmit={handleSignUpAction}>
      <div className="grid gap-2">
        <label className="font-medium">
          Full name <span className="text-red-400">*</span>
        </label>
        <input
          required
          disabled={isLoading}
          name="fullName"
          type="text"
          placeholder="Your full name"
          className={`rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${!validFullName && "border-[#f03e3e]"}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValidFullName(fullNameRegex.test(event.target.value))
          }
        />
      </div>
      <div className="grid gap-2">
        <label className="font-medium">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          required
          disabled={isLoading}
          name="email"
          type="email"
          placeholder="Your email"
          className={`rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${!validEmail && "border-[#f03e3e]"}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValidEmail(emailRegex.test(event.target.value))
          }
        />
      </div>
      <div className="mb-2 grid gap-2">
        <label className="font-medium">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="flex">
          <input
            required
            disabled={isLoading}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className={`password__input rounded-y-md w-full rounded-l-md border-y-2 border-l-2 border-[#dbe4ff] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${!validPassword && "border-[#f03e3e]"}`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValidPassword(event.target.value.length >= 8 ? true : false)
            }
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={handleShowPassword}
            className={`show__password rounded-r-md border-y-2 border-r-2 border-[#dbe4ff] py-2 pr-4 focus:outline-0 disabled:cursor-not-allowed ${!validPassword && "border-[#f03e3e]"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="size-6 stroke-[#616572]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              {showPassword ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              )}
            </svg>
          </button>
          <div className="hidden">
            <label htmlFor="verify__name">Verify your name</label>
            <input
              type="text"
              id="verify__name"
              name="verify__name"
              onChange={(event) => setHoneyPot(event.target.value)}
            />
          </div>
        </div>
      </div>
      <SignInCredentialsButton isLoading={isLoading}>
        Sign up
      </SignInCredentialsButton>
    </form>
  );
}
