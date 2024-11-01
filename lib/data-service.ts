import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  createVerificationToken,
  deleteVerificationToken,
} from "@/lib/auth-actions";
import { IUser } from "@/components/UserManagementSection";
import { IPost } from "@/components/AnnouncementSection";
import { ILevels } from "@/app/user/announcements/page";

export async function getUser(email: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function getUserByUserId(email: string): Promise<IUser | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function getAllPosts(): Promise<IPost[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return data;
}

export async function getPostsByLevel(levels: string): Promise<IPost[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("levels", levels)
    .order("created_at", { ascending: false });

  return data;
}

export async function getPostById(id: string): Promise<IPost | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export async function getAllLevels(): Promise<ILevels[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase.from("levels").select("*");

  return data;
}

export async function getClassByTeacherId(id: string) {
  const { data } = await supabase
    .from("classroom")
    .select("*")
    .eq("teacherId", id)
    .order("created_at", { ascending: false });

  return data;
}

export async function getClassNameByClassId(id: string) {
  const { data } = await supabase
    .from("classroom")
    .select("className")
    .eq("id", id)
    .single();

  return data;
}

export async function getClassByClassId(id: string) {
  const { data } = await supabase.from("classroom").select("*").eq("id", id);

  return data;
}

export async function getVerificationToken(email: string) {
  const { data } = await supabase
    .from("verificationTokens")
    .select("*")
    .eq("email", email);

  return data;
}

export async function generateVerificationToken(email: string) {
  const token = generateOTP();
  const expires = new Date().getTime() + 1000 * 60 * 60 * 1;

  const existingToken = await getVerificationToken(email);

  if (existingToken) {
    await deleteVerificationToken(email);
  }

  const verificationToken = await createVerificationToken({
    email,
    token,
    expires: new Date(expires),
  });

  return verificationToken;
}
