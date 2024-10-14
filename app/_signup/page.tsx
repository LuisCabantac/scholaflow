import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import signUpPageImage from "@/public/landing_page/signup-page.svg";

import Logo from "@/components/Logo";
import SignUpForm from "@/components/SignUpForm";
import SignInGoogleButton from "@/components/SignInGoogleButton";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <section className="px-6 py-16 md:grid md:grid-cols-[60%_40%] md:px-24 md:py-16">
      <div className="relative mx-0 my-auto w-[80%]">
        <Image
          src={signUpPageImage}
          alt="road to knowledge"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-y-10">
        <Logo />
        <h2 className="text-3xl font-bold md:text-4xl">Create your account</h2>
        <div className="grid gap-3">
          <SignUpForm />
          <SignInGoogleButton />
        </div>
        <p className="mx-auto my-0 text-sm">
          Have an account?{" "}
          <Link href="/signin" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
