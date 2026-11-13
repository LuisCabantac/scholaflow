import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import {
  addMemberFlow,
  createClassFlow,
  deleteClassFlow,
  joinClassFlow,
  leaveClassFlow,
  removeMemberFlow,
  updateClassFlow,
} from "@/services/classroom-flows";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByClassId,
  getAllEnrolledClassesByUserId,
  getClassByClassCode,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
  isClassMember,
} from "@/services/classroom";

export const getAllClassesByTeacherIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== id) return null;

    return await getAllClassesByTeacherId(id);
  });

export const getClassByClassIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(id);
    if (!classroom || classroom.teacherId === session.user.id) return classroom;

    return { ...classroom, code: "" };
  });

export const getClassByClassCodeFn = createServerFn({ method: "GET" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassByClassCode(code);
  });

export const getEnrolledClassByClassAndSessionIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; classId: string }) => data)
  .handler(async ({ data: { userId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== userId) return null;

    return await getEnrolledClassByClassAndSessionId(userId, classId);
  });

export const getAllEnrolledClassesByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== userId) return null;

    return await getAllEnrolledClassesByUserId(userId);
  });

export const getAllEnrolledClassesByClassIdFn = createServerFn({
  method: "GET",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !(await isClassMember(session.user.id, classId))) {
      return null;
    }

    return await getAllEnrolledClassesByClassId(classId);
  });

export const createClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session)
      return { success: false, message: "Unauthorized", classUrl: "" };

    const outcome = await createClassFlow(session.user, {
      name: (formData.get("className") as string) || "",
      subject: (formData.get("subject") as string | null) || null,
      section: (formData.get("section") as string) || "",
      room: (formData.get("room") as string | null) || null,
      color: (formData.get("color") as string) || "",
    });

    if (!outcome.ok)
      return { success: false, message: outcome.message, classUrl: "" };

    return {
      success: true,
      message: "Class created successfully!",
      classUrl: `/classroom/class/${outcome.value.id}`,
    };
  });

export const updateClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session)
      return { success: false, message: "Unauthorized", classUrl: "" };

    const classroomId = formData.get("classroomId") as string;
    const outcome = await updateClassFlow(session.user, classroomId, {
      name: formData.get("className") as string,
      subject: formData.get("subject") as string,
      section: formData.get("section") as string | null,
      description: formData.get("classDescription") as string | null,
      color: formData.get("color") as string,
      allowUsersToComment: formData.get("allowStudentsToComment") === "true",
      allowUsersToPost: formData.get("allowStudentsToPost") === "true",
      regenerateCode: formData.get("updateClassCode") === "true",
    });

    if (!outcome.ok)
      return { success: false, message: outcome.message, classUrl: "" };

    if (!outcome.value.changed)
      return {
        success: true,
        message: "No changes were made to the class.",
        classUrl: "",
      };

    return {
      success: true,
      message: "Class updated successfully!",
      classUrl: `/classroom/class/${classroomId}`,
    };
  });

export const joinClassFn = createServerFn({ method: "POST" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await joinClassFlow(session.user, code);
    if (!outcome.ok) return { success: false, message: outcome.message };

    return {
      success: true,
      message: "You've successfully joined the class!",
      classId: outcome.value.classId,
    };
  });

export const deleteEnrolledClassbyClassAndEnrolledClassIdFn = createServerFn({
  method: "POST",
})
  .validator((data: { enrolledClassId: string; classId: string }) => data)
  .handler(async ({ data: { classId, enrolledClassId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await removeMemberFlow(
      session.user,
      classId,
      enrolledClassId,
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "Member removed from class." };
  });

export const deleteClassFn = createServerFn({ method: "POST" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroom = await getClassByClassId(classId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    if (classroom.teacherId === session.user.id) {
      const outcome = await deleteClassFlow(session.user, classId);
      if (!outcome.ok) return { success: false, message: outcome.message };
      return { success: true, message: "Class deleted successfully." };
    }

    const outcome = await leaveClassFlow(session.user, classId);
    if (!outcome.ok) return { success: false, message: outcome.message };

    return {
      success: true,
      message: "You've successfully left the class.",
    };
  });

export const addUserToClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await addMemberFlow(
      session.user,
      formData.get("classroomId") as string,
      formData.get("email") as string,
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "User successfully added to class!" };
  });
