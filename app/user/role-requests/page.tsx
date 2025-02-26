import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getAllRoleRequest } from "@/lib/data-service";

import RoleRequestsSection from "@/components/RoleRequestsSection";

export const metadata: Metadata = {
  title: "Role Requests",
  description: "Manage user accounts role requests.",
};

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) redirect("/signin");

  if (session.user.role !== "admin") redirect("/user/classroom");

  async function handleGetAllRequests(status: "pending" | "rejected") {
    "use server";
    const requests = await getAllRoleRequest(status);
    return requests;
  }

  return <RoleRequestsSection onGetAllRequests={handleGetAllRequests} />;
}
