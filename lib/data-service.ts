import { auth } from "@/lib/auth";
import { generateOTP, hasUser } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  createVerificationToken,
  deleteVerificationToken,
} from "@/lib/auth-actions";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";
import { INotes } from "@/app/user/notes/page";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";

import { IClass } from "@/components/ClassroomSection";
import { IUser } from "@/components/UserManagementSection";
import { IChat } from "@/components/ClassChatSection";
import { ITopic } from "@/components/TopicDialog";
import { IRoleRequest } from "@/components/RoleRequestDialog";

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

export async function getClassStreamByStreamId(
  streamId: string,
): Promise<IStream | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("streams")
    .select("*")
    .eq("id", streamId)
    .single();

  return data;
}

export async function getAllClassworkStreamsByClassId(
  classId: string,
): Promise<IStream[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classId);

  if (!classroom) return null;

  const { data } = await supabase
    .from("streams")
    .select("*")
    .eq("classroomId", classId)
    .neq("type", "stream")
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllClassworkStreamsByTopicId(
  topicId: string,
): Promise<IStream[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const topic = await getClassTopicByTopicId(topicId);

  if (!topic) return null;

  const { data } = await supabase
    .from("streams")
    .select("*")
    .eq("topicId", topicId)
    .neq("type", "stream")
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllClassworksByClassId(
  classId: string,
): Promise<IClasswork[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("classroomId", classId);

  return data;
}

export async function getAllClassworksByStreamId(
  streamId: string,
): Promise<IClasswork[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("streamId", streamId);

  return data;
}

export async function getAllClassworksByUserId(
  userId: string,
): Promise<IClasswork[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("userId", userId);

  return data;
}

export async function getAllClassworksByClassAndUserId(
  userId: string,
  classId: string,
): Promise<IClasswork[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("userId", userId)
    .eq("classroomId", classId);

  return data;
}

export async function getClassworkByClassAndUserId(
  userId: string,
  classId: string,
  streamId: string,
): Promise<IClasswork | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return null;

  if (!(stream.announceToAll || stream.announceTo.includes(userId)))
    return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("userId", userId)
    .eq("classroomId", classId)
    .eq("streamId", streamId)
    .single();

  return data;
}

export async function getClassworksByClassIdQuery(
  classId: string,
  query: string,
): Promise<IStream[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classId);

  if (!classroom) return null;

  const { data } = await supabase
    .from("streams")
    .select("*")
    .eq("classroomId", classId)
    .neq("type", "stream")
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllAssignedClassworksByStreamAndClassroomId(
  classId: string,
  streamId: string,
): Promise<IClasswork[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return null;

  if (classroom.teacherId !== session.user.id) return null;

  const { data } = await supabase
    .from("classworks")
    .select("*")
    .eq("classroomId", classId)
    .eq("streamId", streamId);

  return data;
}

export async function getAllCommentsByStreamId(
  streamId: string,
): Promise<IStreamComment[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classComments")
    .select("*")
    .eq("streamId", streamId);

  return data;
}

export async function getAllPrivateCommentsByStreamId(
  streamId: string,
): Promise<IStreamComment[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classPrivateComments")
    .select("*")
    .eq("streamId", streamId);

  return data;
}

export async function getStreamCommentByCommentId(
  commentId: string,
): Promise<IStreamComment | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classComments")
    .select("*")
    .eq("id", commentId)
    .single();

  return data;
}

export async function getStreamPrivateCommentByCommentId(
  commentId: string,
): Promise<IStreamComment | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classPrivateComments")
    .select("*")
    .eq("id", commentId)
    .single();

  return data;
}

export async function getAllMessagesByClassId(
  classroomId: string,
): Promise<IChat[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom) return null;

  const enrolledClass = await getEnrolledClassByClassAndSessionId(classroomId);

  if (!(classroom.teacherId === session.user.id || enrolledClass)) return null;

  const { data } = await supabase
    .from("chat")
    .select("*")
    .eq("classroomId", classroomId);

  return data;
}

export async function getAllMessagesByUserId(
  userId: string,
): Promise<IChat[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const user = await getUserByUserId(userId);

  if (!user) return null;

  const { data } = await supabase.from("chat").select("*").eq("author", userId);

  return data;
}

export async function getClassTopicByTopicId(
  topicId: string,
): Promise<ITopic | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classTopic")
    .select("*")
    .eq("topicId", topicId)
    .single();

  return data;
}

export async function getAllClassTopicsByClassId(
  classId: string,
): Promise<ITopic[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("classTopic")
    .select("*")
    .eq("classroomId", classId)
    .order("created_at", { ascending: false });

  return data;
}

export async function getAllNotesBySession(): Promise<INotes[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("author", session.user.id)
    .order("created_at", { ascending: false });

  return data;
}

export async function getNoteByNoteIdSession(
  noteId: string,
): Promise<INotes | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("author", session.user.id)
    .eq("id", noteId)
    .single();

  return data;
}

export async function getAllNotesBySessionQuery(
  query: string,
): Promise<INotes[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("author", session.user.id)
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false });

  return data;
}

export async function getVerificationToken(email: string) {
  const { data } = await supabase
    .from("verificationTokens")
    .select("*")
    .eq("email", email);

  return data;
}

export async function getRoleRequest(
  userId: string,
): Promise<IRoleRequest | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  const user = await getUserByUserId(userId);

  if (!user) return null;

  const { data } = await supabase
    .from("roleRequests")
    .select("*")
    .eq("userId", userId)
    .single();

  return data;
}

export async function getAllRoleRequest(
  status: "pending" | "rejected",
): Promise<IRoleRequest[] | null> {
  const session = await auth();

  if (!hasUser(session)) return null;

  if (session.user.role !== "admin") return null;

  const { data } = await supabase
    .from("roleRequests")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

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
