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

export async function getUserByUserId(userId: string): Promise<IUser | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
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

export async function getAllUser() {
  const session = await auth();

  if (!hasUser(session))
    return { success: false, message: "Error getting all users", data: null };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return { success: false, message: "Error getting all users", data: null };

  return { success: true, message: "Fetch success", data };
}

export async function getUsersFilter(name: string) {
  const session = await auth();

  if (!hasUser(session))
    return { success: false, message: "Error getting all users", data: null };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("fullName", `%${name}%`);

  if (error)
    return { success: false, message: "Error getting all users", data: null };

  return { success: true, message: "Fetch success", data };
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

export async function getAllClassesByTeacherId(
  id: string,
): Promise<IClass[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classroom")
    .select("*")
    .eq("teacherId", id)
    .order("created_at", { ascending: false });

  return data;
}

export async function getClassNameByClassId(id: string): Promise<{
  className: string;
} | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classroom")
    .select("className")
    .eq("classroomId", id)
    .single();

  return data;
}

export async function getClassByClassId(id: string): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classroom")
    .select("*")
    .eq("classroomId", id)
    .single();

  return data;
}

export async function getClassByClassCode(
  code: string,
): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classroom")
    .select("*")
    .eq("classCode", code)
    .single();

  return data;
}

export async function getEnrolledClassByClassAndSessionId(
  classId: string,
): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("userId", session.user.id)
    .eq("classroomId", classId)
    .single();

  return data;
}

export async function getEnrolledClassByEnrolledClassId(
  enrolledClassId: string,
): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("id", enrolledClassId)
    .single();

  return data;
}

export async function getAllEnrolledClassesByClassAndSessionId(
  classId: string,
): Promise<IClass[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  if (session.user.role !== "teacher") return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("classroomId", classId);

  return data;
}

export async function getAllEnrolledClassesByClassAndCurrentSessionId(
  classId: string,
): Promise<IClass[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("classroomId", classId)
    .eq("userId", session.user.id);

  return data;
}

export async function getEnrolledClassByClassAndUserId(
  userId: string,
  classId: string,
): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  if (session.user.role !== "teacher") return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("classroomId", classId)
    .eq("userId", userId)
    .single();

  return data;
}

export async function getAllEnrolledClassesByUserId(
  userId: string,
): Promise<IClass[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("userId", userId)
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllEnrolledClassesByClassId(
  classId: string,
): Promise<IClass[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("classroomId", classId);

  return data;
}

export async function getEnrolledClassByUserAndClassId(
  userId: string,
  classId: string,
): Promise<IClass | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("enrolledClass")
    .select("*")
    .eq("userId", userId)
    .eq("classroomId", classId)
    .single();

  return data;
}

export async function getAllClassStreamsByClassId(
  classId: string,
): Promise<IStream[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("streams")
    .select("*")
    .eq("classroomId", classId)
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllEnrolledClassesClassworks(
  userId: string,
): Promise<IStream[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const enrolledClasses = await getAllEnrolledClassesByUserId(userId);

  const classworks = Array.isArray(enrolledClasses)
    ? await Promise.all(
        enrolledClasses.map(
          async (enrolledClass) =>
            await getAllClassworkStreamsByClassId(enrolledClass.classroomId),
        ),
      )
    : [];

  return classworks
    .filter((array): array is IStream[] => array !== null)
    .flat();
}
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
