"use client";

import Link from "next/link";

import { useNav } from "@/contexts/NavContext";

import { Session } from "@/lib/schema";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import ProfileIcon from "@/components/ProfileIcon";

export default function HomeNav({ session }: { session: Session | undefined }) {
  const { isSticky } = useNav();

  return (
    <nav
      className={`sticky top-0 z-10 flex items-center justify-between bg-background/90 transition-all ${isSticky && "border-b backdrop-blur-3xl"} px-4 py-4 md:px-8 lg:px-12`}
    >
      <Link href="/" className="cursor-pointer select-none">
        <Logo />
      </Link>
      {session ? (
        <ProfileIcon
          avatar={session.image ?? ""}
          email={session.email}
          fullName={session.name}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Button variant="ghost" asChild>
              <Link href="/signin">Log in</Link>
            </Button>
          </div>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
