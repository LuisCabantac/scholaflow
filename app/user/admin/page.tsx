import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "admin") return redirect("/user/dashboard");

  return <div>HELLO ADMIN</div>;
}
