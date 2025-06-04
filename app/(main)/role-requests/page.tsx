import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAllRoleRequest } from "@/lib/user-management-service";

import RoleRequestsSection from "@/components/RoleRequestsSection";

export const metadata: Metadata = {
  title: "Role Requests",
  description: "Manage user accounts role requests.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/signin");

  if (session.user.role !== "admin") redirect("/classroom");

  async function handleGetAllRequests(status: "pending" | "rejected") {
    "use server";
    const requests = await getAllRoleRequest(status);
    return requests;
  }

  return <RoleRequestsSection onGetAllRequests={handleGetAllRequests} />;
}
