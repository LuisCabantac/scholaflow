import type { SessionUser } from "@/server/functions/auth";

import HeaderTitle from "@/components/layout/HeaderTitle";
import SidebarHeaderButton from "@/components/layout/SidebarHeaderButton";
import UserMenu from "@/components/shared/UserMenu";

export default function Header({ user }: { user: SessionUser }) {
  return (
    <header className="bg-background sticky top-0 z-10 flex w-full items-center justify-between px-4 py-4 backdrop-blur-md md:px-8">
      <div className="flex w-[88%] items-center gap-2">
        <SidebarHeaderButton />
        <HeaderTitle />
      </div>
      <UserMenu
        avatar={user.image ?? ""}
        email={user.email}
        fullName={user.name}
      />
    </header>
  );
}
