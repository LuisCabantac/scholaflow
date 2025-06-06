import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getAllClassworksByUserId } from "@/lib/classwork-service";
import { getAllEnrolledClassesClassworks } from "@/lib/stream-service";

import ToDoSection from "@/components/ToDoSection";

export const metadata: Metadata = {
  title: "To-do",
  description:
    "Manage your classwork effectively with this comprehensive to-do list. View all your assigned, missing, and completed tasks in one organized place. Stay on top of your studies and track your progress effortlessly.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  async function handleGetAllEnrolledClassesClassworks(userId: string) {
    "use server";
    const data = await getAllEnrolledClassesClassworks(userId);
    return data;
  }

  async function handleGetAllClassworks(userId: string) {
    "use server";
    const data = await getAllClassworksByUserId(userId);
    return data;
  }

  return (
    <ToDoSection
      session={session.user}
      onGetAllClassworks={handleGetAllClassworks}
      onGetAllEnrolledClassesClassworks={handleGetAllEnrolledClassesClassworks}
    />
  );
}
