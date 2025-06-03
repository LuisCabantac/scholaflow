"use client";

import Link from "next/link";

import { useNav } from "@/contexts/NavContext";

import { ISession } from "@/lib/auth";

import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProfileIcon from "@/components/ProfileIcon";

export default function HomeNav({
  session,
}: {
  session: ISession | undefined;
}) {
  const { isSticky } = useNav();

  return (
    <nav
      className={`sticky top-0 z-10 flex items-center justify-between transition-all ${isSticky && "bg-[#edf2ffe5] backdrop-blur-md"} px-4 py-4 md:px-8 lg:px-12`}
    >
      <Link href="/" className="cursor-pointer">
        <Logo />
      </Link>
      {session ? (
        <ProfileIcon
          avatar={session.image ?? ""}
          email={session.email}
          fullName={session.name}
          role={session.role}
        />
      ) : (
        <div className="flex gap-2">
          <div className="hidden md:block">
            <Button href="/signin" type="secondary">
              Log in
            </Button>
          </div>
          <Button href="/signup" type="primary">
            Sign up
          </Button>
        </div>
      )}
    </nav>
  );
}
