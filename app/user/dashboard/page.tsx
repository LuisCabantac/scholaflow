import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import DashboardSection from "@/components/DashboardSection";
import AccessDenied from "@/components/AccessDenied";

export default async function Page() {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "guest") return <AccessDenied />;

  return <DashboardSection />;
}
