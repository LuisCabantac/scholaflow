"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";

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

export default function ProfileIcon({
  email,
  avatar,
  fullName,
}: {
  email: string;
  avatar: string;
  fullName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Image
            src={avatar}
            alt="profile image"
            width={40}
            height={40}
            className="h-8 w-8 cursor-pointer rounded-full border object-cover transition-all md:h-10 md:w-10"
            onDragStart={(e) => e.preventDefault()}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-52" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Image
            src={avatar}
            alt="profile image"
            width={20}
            height={20}
            className="h-6 w-6 cursor-pointer rounded-full border object-cover transition-all md:h-10 md:w-10"
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="min-w-0 flex-1">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {fullName}
            </span>
            <p className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-foreground/90">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="text-foreground/80">
          <DropdownMenuItem className="mt-1 text-xs font-medium">
            <Link
              href="/profile"
              className="flex h-4 w-full items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="mt-1 text-xs font-medium">
            <button
              className="flex h-4 w-full items-center gap-2"
              onClick={() =>
                theme === "dark" ? setTheme("light") : setTheme("dark")
              }
            >
              <div className="relative h-4 w-4">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all group-hover:text-neutral-800 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute top-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:dark:text-neutral-200" />
              </div>
              <span>{theme === "dark" ? "Dark" : "Light"} mode</span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem className="mb-2 mt-1 text-xs font-medium">
            <button
              className="flex h-4 w-full items-center gap-2"
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
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
