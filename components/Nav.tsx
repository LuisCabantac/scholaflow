import Link from "next/link";

import { auth } from "@/lib/auth";

import Logo from "@/components/Logo";
import HomeNav from "@/components/HomeNav";

export default async function Nav({ showButton }: { showButton: boolean }) {
  const session = await auth();

  if (!showButton)
    return (
      <nav className="flex items-center justify-between px-4 py-4 md:px-10 md:pb-5 md:pt-[1.6rem]">
        <Link href="/" className="cursor-pointer">
          <Logo />
        </Link>
      </nav>
    );

  return <HomeNav session={session} />;
}
