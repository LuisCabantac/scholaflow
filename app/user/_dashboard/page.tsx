import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import DashboardSection from "@/components/DashboardSection";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  return <DashboardSection />;
}
