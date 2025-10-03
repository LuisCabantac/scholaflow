import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import Logo from "@/components/Logo";
import VerifySection from "@/components/VerifySection";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Verify your email address to complete your account setup and access your classroom.",
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
            <Logo />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Verify your email
            </CardHeader>
            <VerifySection />
          </Card>
        </div>
      </div>
    </section>
  );
}
