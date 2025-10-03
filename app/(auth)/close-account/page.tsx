import Link from "next/link";
import { Metadata } from "next";

import Logo from "@/components/Logo";
import { Card, CardHeader } from "@/components/ui/card";
import CloseAccountSection from "@/components/CloseAccountSection";

export const metadata: Metadata = {
  title: "Close Account",
  description:
    "Close your ScholaFlow account permanently and delete all associated data.",
};

export default async function Page() {
  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-[8rem] md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <Logo />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Close your account
            </CardHeader>
            <CloseAccountSection />
          </Card>
        </div>
      </div>
    </section>
  );
}
