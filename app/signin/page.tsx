import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import signInPageImage from "@/public/landing_page/login-page.svg";
import { auth } from "@/lib/auth";

import Logo from "@/components/Logo";
import SignInForm from "@/components/SignInForm";
import SignInGoogleButton from "@/components/SignInGoogleButton";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function Page() {
  const session = await auth();

  if (session) return redirect("/user/dashboard");

  return (
    <section className="flex items-center justify-center px-8 py-[8rem] md:grid md:grid-cols-[60%_40%] md:p-24">
      <div className="relative mx-0 my-auto w-0 md:w-[70%]">
        <Image
          src={signInPageImage}
          alt="road to knowledge"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-y-10">
        <Logo />
        <h2 className="text-3xl font-bold md:text-4xl">Welcome back!</h2>
        <div className="grid gap-3">
          <SignInForm />
          <SignInGoogleButton />
        </div>
      </div>
    </section>
  );
}
