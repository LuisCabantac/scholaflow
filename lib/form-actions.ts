"use server";

import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import { IForm } from "@/components/FormsSection";

export async function createForm(
  userId: string,
): Promise<{ success: boolean; message: string; formUrl?: string } | null> {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "teacher") {
    return {
      success: false,
      message: "Only school teachers can create classes.",
    };
  }

  const newForm = {
    author: userId,
    questionSet: [
      {
        id: uuidv4(),
        question: "Untitled Question",
        type: "multipleChoice",
        options: ["Option 1"],
      },
    ],
  };

  const { data, error } = await supabase
    .from("forms")
    .insert([newForm])
    .select();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/user/forms");

  return {
    success: true,
    message: "Class created successfully!",
    formUrl: `/user/forms/${(data[0] as IForm).id}/edit`,
  };
}
