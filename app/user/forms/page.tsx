import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getAllFormsByUserId } from "@/lib/data-service";

import FormsSection from "@/components/FormsSection";

export const metadata: Metadata = {
  title: "Forms",
  description:
    "Create custom online forms, surveys, and quizzes with features like diverse question types, data validation, and response tracking.",
};

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "student") redirect("/user/classroom");

  async function getAllForms(userId: string) {
    "use server";
    const forms = await getAllFormsByUserId(userId);
    return forms;
  }

  return <FormsSection session={session} onGetAllForms={getAllForms} />;
}
