import { Metadata } from "next";
import Image from "next/image";

import signInPageImage from "@/public/landing_page/login-page.svg";

import Logo from "@/components/Logo";
import SignInForm from "@/components/SignInForm";
import SignInGoogleButton from "@/components/SignInGoogleButton";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Page() {
  return (
    <section className="flex items-center justify-center px-8 py-[10rem] md:grid md:grid-cols-[60%_40%] md:px-24 md:py-16">
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