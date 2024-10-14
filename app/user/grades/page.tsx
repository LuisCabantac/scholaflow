import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

export default async function Page() {
  const session = await auth();
  if (!session) return redirect("/signin");

  if (
    hasUser(session) &&
    session.user.role !== "teacher" &&
    !session.user.verified
  )
    return redirect("/");
}
