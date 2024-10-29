import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import userManage from "@/public/app/user_management.svg";
import programManage from "@/public/app/program_management.svg";

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "admin") return redirect("/user/dashboard");

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h2 className="text-lg font-medium md:text-xl">User Management</h2>
        <Link
          href="/user/admin/user-management"
          className="flex items-center gap-8 rounded-md border-2 bg-[#f3f6ff] p-4 md:text-lg"
        >
          <div className="relative w-[10rem]">
            <Image src={userManage} alt="user management" />
          </div>
          <span>Manage roles and user accounts.</span>
        </Link>
      </div>
      <div className="grid gap-2">
        <h2 className="text-lg font-medium md:text-xl">Program Management</h2>
        <Link
          href="/user/admin/program-management"
          className="flex items-center gap-8 rounded-md border-2 bg-[#f3f6ff] p-4 md:text-lg"
        >
          <div className="relative w-[10rem]">
            <Image src={programManage} alt="program management" />
          </div>
          <span>Manage programs and courses for all levels.</span>
        </Link>
      </div>
    </section>
  );
}
