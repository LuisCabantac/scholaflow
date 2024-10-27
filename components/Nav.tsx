import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProfileIcon from "@/components/ProfileIcon";

export default async function Nav({ showButton }: { showButton: boolean }) {
  const session = await auth();

  if (!showButton)
    return (
      <nav className="flex items-center justify-between px-4 py-4 md:px-10 md:pb-5 md:pt-[1.6rem]">
        <Logo />
      </nav>
    );

  return (
    <nav className="flex items-center justify-between px-4 py-4 md:px-10 md:py-5">
      <Logo />
      {hasUser(session) ? (
        <ProfileIcon
          avatar={session.user.image}
          email={session.user.email}
          fullName={session.user.name}
          role={session.user.role}
          school={session.user.schoolName}
        />
      ) : (
        <div className="flex gap-2">
          <Button href="/signin" type="primary">
            Sign in
          </Button>
          {/* <Button href="/signup" type="primary">
            Sign up
          </Button> */}
        </div>
      )}
    </nav>
  );
}
