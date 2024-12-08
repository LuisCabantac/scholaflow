"use client";

import { Session } from "next-auth";
import Link from "next/link";

import { hasUser } from "@/lib/utils";
import { useNav } from "@/contexts/NavContext";

import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProfileIcon from "@/components/ProfileIcon";

export default function HomeNav({ session }: { session: Session | null }) {
  const { isSticky } = useNav();

  return (
    <nav
      className={`sticky top-0 z-10 flex items-center justify-between transition-all ${isSticky && "bg-[#edf2ffe5] backdrop-blur-md"} px-4 py-4 md:px-8`}
    >
      <Link href="/" className="cursor-pointer">
        <Logo />
      </Link>
      {session && hasUser(session) ? (
        <ProfileIcon
          avatar={session.user.image}
          email={session.user.email}
          fullName={session.user.name}
          role={session.user.role}
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
