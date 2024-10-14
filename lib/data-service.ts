import { supabase } from "@/lib/supabase";
import {
  createVerificationToken,
  deleteVerificationToken,
} from "@/lib/auth-actions";
import { generateOTP } from "@/lib/utils";

export async function getUser(email: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function getUserEmail(email: string) {
  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  return data;
}

export async function getPosts(school: string, levels: string) {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("school", school)
    .eq("levels", levels)
    .order("created_at", { ascending: false });

  return data;
}

export async function getPostById(id: string) {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export async function getAllLevels(school: string) {
  const { data } = await supabase
    .from("levels")
    .select("*")
    .eq("school", school);

  return data;
}

export async function getSchool(school: string) {
  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("schoolId", school);

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
