import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import { signOut } from "@/lib/auth-client";
import { useTheme } from "@/providers/ThemeProvider";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu({
  email,
  avatar,
  fullName,
}: {
  email: string;
  avatar: string;
  fullName: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation(["common", "auth"]);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <img
            src={avatar}
            alt="profile"
            width={40}
            height={40}
            className="h-8 w-8 cursor-pointer rounded-full border object-cover transition-all md:h-10 md:w-10"
            onDragStart={(e) => e.preventDefault()}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-52" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <img
            src={avatar}
            alt="profile"
            width={20}
            height={20}
            className="h-6 w-6 cursor-pointer rounded-full border object-cover transition-all md:h-10 md:w-10"
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="min-w-0 flex-1">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {fullName}
            </span>
            <p className="text-foreground/90 block overflow-hidden text-xs font-normal text-ellipsis whitespace-nowrap">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="text-foreground/80">
          <DropdownMenuItem className="mt-1 text-xs font-medium" asChild>
            <Link
              to="/profile"
              className="flex h-full w-full flex-1 cursor-pointer items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>{t("common:profile")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="mt-1 text-xs font-medium" asChild>
            <button
              type="button"
              className="flex h-full w-full cursor-pointer items-center gap-2"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <div className="relative h-4 w-4">
                <Sun className="h-4 w-4 scale-100 rotate-0 transition-all group-hover:text-neutral-800 dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute top-0 h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 group-hover:dark:text-neutral-200" />
              </div>
              <span>{isDark ? t("theme.dark") : t("theme.light")}</span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem className="mt-1 mb-2 text-xs font-medium">
            <button
              type="button"
              className="flex h-4 w-full cursor-pointer items-center gap-2"
              onClick={async () => {
                await signOut({
                  fetchOptions: {
                    onSuccess: async () => {
                      await navigate({
                        to: pathname === "/" ? "/" : "/sign-in",
                      });

                      toast.success(t("auth:signOut.messages.success"));
                    },
                  },
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>{t("auth:actions.signOut")}</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
