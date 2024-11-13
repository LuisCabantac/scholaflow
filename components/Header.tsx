import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getClassByClassId } from "@/lib/data-service";

import ProfileIcon from "@/components/ProfileIcon";
import HeaderTitle from "@/components/HeaderTitle";
import SidebarHeaderButton from "@/components/SidebarHeaderButton";

export default async function Header() {
  const session = await auth();

  async function handleGetClassByClassId(classId: string) {
    "use server";
    const classroom = await getClassByClassId(classId);
    return classroom;
  }

  return (
    <header className="flex items-center justify-between pb-5">
      <div className="flex items-center gap-2">
        <SidebarHeaderButton />
        <HeaderTitle onGetClassByClassId={handleGetClassByClassId} />
      </div>
      {hasUser(session) ? (
        <ProfileIcon
          avatar={session.user.image}
          email={session.user.email}
          fullName={session.user.name}
          role={session.user.role}
        />
      ) : null}
    </header>
  );
}
