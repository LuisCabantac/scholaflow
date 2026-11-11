import { cn } from "cn";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useSession } from "@/lib/auth-client";
import { useNav } from "@/providers/NavProvider";

import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/shared/UserMenu";

export default function Nav({ showButton }: { showButton: boolean }) {
  const { data } = useSession();
  const { isSticky } = useNav();
  const { t } = useTranslation("auth", { keyPrefix: "actions" });

  if (!showButton)
    return (
      <nav className="flex items-center justify-between px-4 py-4 md:px-10 md:pt-[1.6rem] md:pb-5 lg:px-12">
        <Link to="/" className="cursor-pointer">
          <Logo />
        </Link>
      </nav>
    );

  return (
    <nav
      className={cn(
        "bg-background sticky top-0 z-10 flex items-center justify-between border-b border-transparent px-4 py-4 transition-[border-color,background-color,backdrop-filter] md:px-12 lg:px-20",
        isSticky && "border-border bg-background/80 backdrop-blur-3xl",
      )}
    >
      <Link to="/" className="cursor-pointer select-none">
        <Logo />
      </Link>
      {data ? (
        <UserMenu
          avatar={data.user.image ?? ""}
          email={data.user.email}
          fullName={data.user.name}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Button variant="ghost">
              <Link to="/sign-in">{t("signIn")}</Link>
            </Button>
          </div>
          <Button>
            <Link to="/sign-up">{t("signUp")}</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
