import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import ProfileIcon from "@/components/ProfileIcon";
import HeaderTitle from "@/components/HeaderTitle";
import SidebarHeaderButton from "@/components/SidebarHeaderButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between pb-5">
      <div className="flex items-center gap-2">
        <div className="block md:hidden">
          <SidebarHeaderButton />
        </div>

        <HeaderTitle />
      </div>
      {hasUser(session) ? (
        <ProfileIcon
          avatar={session.user.image}
          email={session.user.email}
          fullName={session.user.name}
          role={session.user.role}
          school={session.user.schoolName}
        />
      ) : null}
    </header>
  );
}
