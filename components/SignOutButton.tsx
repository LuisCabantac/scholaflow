"use client";

import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      className="signout__button flex w-full gap-2 rounded-md px-2 py-2 transition-colors hover:bg-[#d8e0f5]"
      onClick={async () => {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push(pathname === "/" ? "/" : "/signin");
              toast.success("You've been signed out successfully");
            },
          },
        });
      }}
    >
      <svg
        viewBox="0 0 24 24"
        strokeWidth={2}
        className="size-5 fill-transparent stroke-[#5c7cfa] transition-colors"
      >
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
        <path d="M9 12h12l-3 -3" />
        <path d="M18 15l3 -3" />
      </svg>
      <span>Sign out</span>
    </button>
  );
}
