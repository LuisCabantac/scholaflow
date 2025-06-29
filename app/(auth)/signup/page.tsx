import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/auth-service";

import Logo from "@/components/Logo";
import SignUpForm from "@/components/SignUpForm";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Sign up and start learning! Access classes, assignments, and connect with classmates.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) return redirect("/classroom");

  async function generateVerificationTokenClient(email: string) {
    "use server";
    const verification = await generateVerificationToken(email, "sign-up");
    return verification;
  }

  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-[8rem] md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <Logo size={10} />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Create your account
            </CardHeader>
            <SignUpForm
              onGenerateVerificationToken={generateVerificationTokenClient}
            />
            <p className="flex items-center justify-center gap-1 text-sm">
              Already have an account?
              <Link href="/signin" className="font-medium">
                Sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
