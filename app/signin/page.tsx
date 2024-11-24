import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import signInPageImage from "@/public/landing_page/login-page.svg";
import { auth } from "@/lib/auth";

import Logo from "@/components/Logo";
import SignInForm from "@/components/SignInForm";
import SignInGoogleButton from "@/components/SignInGoogleButton";

export const metadata: Metadata = {
  title: "Sign-in",
  description:
    "Sign in to access your classes, assignments, and connect with your classmates.",
};

export default async function Page() {
  const session = await auth();

  if (session) return redirect("/user/classroom");

  return (
    <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(237,242,255,0.3),rgba(255,255,255,0))]">
      <section className="flex items-center justify-center px-8 py-[8rem] md:grid md:grid-cols-[60%_40%] md:px-24 md:py-24">
        <div className="relative mx-0 my-auto w-0 md:w-[70%]">
          <Image
            src={signInPageImage}
            alt="road to knowledge"
            className="object-cover"
          />
        </div>
        <div className="flex w-full flex-col justify-center gap-10">
          <Logo />
          <h2 className="text-3xl font-semibold md:text-5xl">Welcome back!</h2>
          <div className="grid gap-3">
            <SignInForm />
            <SignInGoogleButton />
          </div>
        </div>
      </section>
    </div>
  );
}
