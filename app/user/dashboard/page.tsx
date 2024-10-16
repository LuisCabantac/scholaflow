import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import DashboardSection from "@/components/DashboardSection";

export default async function Page() {
  const session = await auth();
  if (!session) return redirect("/signin");

  return <DashboardSection />;
}
