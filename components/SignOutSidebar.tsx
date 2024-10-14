import { signOutAction } from "@/lib/auth-actions";

export default function SignOutSidebar({
  pathname,
  activeLinkStyle,
  inactiveLinkStyle,
}: {
  pathname: string;
  activeLinkStyle: string;
  inactiveLinkStyle: string;
}) {
  return (
    <form action={signOutAction}>
      <button
        className={`sidebar__links flex w-full items-center justify-start gap-2 rounded-md py-3 pl-[1.10rem] transition-all hover:bg-[#c7d2f1] ${pathname === "/signout" ? activeLinkStyle : inactiveLinkStyle} `}
      >
        <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
          <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
          <path d="M9 12h12l-3 -3" />
          <path d="M18 15l3 -3" />
        </svg>
        <span className="text-base transition-all">Sign out</span>
      </button>
    </form>
  );
}
