import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import forgetPasswordPageImage from "@/public/landing_page/forgot-password.svg";

import Logo from "@/components/Logo";
import ForgetPasswordSection from "@/components/ForgetPasswordSection";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your password to regain access to your ScholaFlow account.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) return redirect("/classroom");

  return (
    <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#f3f6ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.2),rgba(255,255,255,0))]">
      <section className="relative flex items-center justify-center px-8 py-[8rem] md:grid md:h-full md:grid-cols-[55%_45%] md:px-24 md:py-0">
        <div className="relative mx-0 my-auto w-0 md:w-[70%]">
          <Image
            src={forgetPasswordPageImage}
            alt="road to knowledge"
            className="select-none object-cover"
          />
        </div>
        <Link href="/" className="absolute left-6 top-6 md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <div className="flex w-full flex-col justify-center gap-10">
          <Logo />
          <div className="grid gap-6">
            <h2 className="text-3xl font-semibold tracking-tighter md:text-5xl">
              Forgot your password?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>
          <div className="grid gap-3">
            <ForgetPasswordSection />
          </div>
          <p className="mx-auto my-0 text-xs">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
