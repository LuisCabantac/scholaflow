import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import Logo from "@/components/layout/Logo";
import { Card, CardHeader } from "@/components/ui/card";

export default function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-32 md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link to="/">
            <Logo />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              {title}
            </CardHeader>
            {children}
            {footer}
          </Card>
        </div>
      </div>
    </section>
  );
}
