import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import Logo from "@/components/Logo";
import SignInForm from "@/components/SignInForm";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to access your classes, assignments, and connect with your classmates.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) return redirect("/classroom");

  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-[8rem] md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <Logo size={10} />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Sign in to your account
            </CardHeader>
            <SignInForm />
            <p className="flex items-center justify-center gap-1 text-sm">
              Don&apos;t have an account?
              <Link href="/signup" className="font-medium">
                Sign up
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
