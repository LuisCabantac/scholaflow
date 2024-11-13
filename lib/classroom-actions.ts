"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { format, parse, subHours } from "date-fns";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  arraysAreEqual,
  capitalizeFirstLetter,
  extractClassworkFilePath,
  extractStreamFilePath,
  generateClassCode,
  hasUser,
} from "@/lib/utils";
import {
  getAllClassStreamsByClassId,
  getAllEnrolledClassesByClassAndSessionId,
  getClassByClassId,
  getClassStreamByStreamId,
  getClassworkByClassAndUserId,
  getEnrolledClassByClassAndSessionId,
  getEnrolledClassByEnrolledClassId,
  getEnrolledClassByUserAndClassId,
  getStreamCommentByCommentId,
  getStreamPrivateCommentByCommentId,
  getUserByEmail,
  getUserByUserId,
} from "@/lib/data-service";
import { deleteFileFromBucket } from "@/lib/announcements-actions";

export async function createClass(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "teacher") {
    return {
      success: false,
      message: "Only school teachers can create classes.",
    };
  }

  const newClass = {
    teacherId: session.user.id,
    teacherName: session.user.name,
    teacherAvatar: session.user.image,
    subject: formData.get("subject"),
    className: formData.get("className"),
    section: formData.get("section"),
    room: formData.get("room"),
    classCardBackgroundColor: formData.get("color"),
    illustrationIndex: Math.floor(Math.random() * 5),
    classCode: generateClassCode(),
  };

  const { error } = await supabase.from("classroom").insert([newClass]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/user/classroom");

  return { success: true, message: "Class created successfully!" };
}

export async function joinClass(classId: string) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only teachers and students can join classes.",
    };
  }

  const classroom = await getClassByClassId(classId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist",
    };

  const newClass = {
    userId: session.user.id,
    userName: session.user.name,
    userAvatar: session.user.image,
    classroomId: classroom.classroomId,
    subject: classroom.subject,
    className: classroom.className,
    section: classroom.section,
    classCardBackgroundColor: classroom.classCardBackgroundColor,
    illustrationIndex: classroom.illustrationIndex,
    teacherName: classroom.teacherName,
    teacherAvatar: classroom.teacherAvatar,
  };

  const { error } = await supabase.from("enrolledClass").insert([newClass]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/user/classroom");

  return { success: true, message: "You've successfully joined the class!" };
}

export async function deleteClass(classId: string) {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin")
    throw new Error("Only the teacher who created this class can delete it.");

  if (session.user.role === "teacher") {
    const classroom = await getClassByClassId(classId);
    if (!classroom) throw new Error("This class doesn't exist.");

    const classes = await getAllEnrolledClassesByClassAndSessionId(classId);
    if (classes?.length) {
      const classroomId = classes.map((curClass) => curClass.classroomId);
      await deleteMultipleEnrolledClass(classroomId);
    }

    const streams = await getAllClassStreamsByClassId(classId);

    if (streams?.length) {
      for (const stream of streams) {
        await deleteClassStreamPost(stream.id);
      }
    }

    const { error } = await supabase
      .from("classroom")
      .delete()
      .eq("classroomId", classId)
      .eq("teacherId", session.user.id);

    revalidatePath("/user/classroom");

    if (error) throw new Error(error.message);

    return;
  }

  const data = await getEnrolledClassByClassAndSessionId(classId);
  if (!data) throw new Error("This class doesn't exist.");

  const { error } = await supabase
    .from("enrolledClass")
    .delete()
    .eq("classroomId", classId)
    .eq("userId", session.user.id);

  revalidatePath("/user/classroom");

  if (error) throw new Error(error.message);

  return;
}

export async function deleteMultipleEnrolledClass(classId: string[]) {
  for (const rowId of classId) {
    const { error } = await supabase
      .from("enrolledClass")
      .delete()
      .eq("classroomId", rowId);

    if (error) throw new Error(error.message);
  }
}

export async function deleteEnrolledClassbyClassAndEnrolledClassId(
  enrolledClassId: string,
  classId: string,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const enrolledClass = getEnrolledClassByEnrolledClassId(enrolledClassId);
  if (!enrolledClass) throw new Error("You are not a member of this class.");

  const classroom = await getClassByClassId(classId);
  if (!classroom) throw new Error("This class doesn't exist.");

  if (classroom.teacherId !== session.user.id)
    throw new Error("You're not authorized to remove this user.");

  const { error } = await supabase
    .from("enrolledClass")
    .delete()
    .eq("id", enrolledClassId)
    .eq("classroomId", classId);

  if (error) throw new Error(error.message);

  revalidatePath(`/user/classroom/class/${classId}/people`);
}

export async function createClassStreamPost(
  audience: string[],
  audienceIsAll: boolean,
  formData: FormData,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Admins and guests are not allowed to post to the class stream.",
    };
  }

  const classroom = await getClassByClassId(
    formData.get("classroomId") as string,
  );

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  if (classroom.teacherId !== session.user.id && !classroom.allowStudentsToPost)
    return {
      success: false,
      message: "Students are not allowed to post to the class.",
    };

  const attachments = formData.getAll("attachments");
  const postAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "streams",
              formData.get("classroomId") as string,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const dueDate = formData.get("dueDate");

  const newStream = {
    author: session.user.id,
    authorName: session.user.name,
    avatar: session.user.image,
    type: formData.get("streamType"),
    title: formData.get("title"),
    caption: formData.get("caption"),
    classroomId: formData.get("classroomId"),
    classroomName: classroom.className,
    announceTo: formData.getAll("announceTo"),
    announceToAll: audienceIsAll,
    attachment: postAttachments,
    links: formData.getAll("links"),
    hasDueDate: dueDate ? "true" : "false",
    dueDate: format(
      formData.get("dueDate") as string,
      "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
    ),
    acceptingSubmissions: formData.get("acceptingSubmissions"),
    closeSubmissionsAfterDueDate: formData.get("closeSubmissionsAfterDueDate"),
    points: formData.get("totalPoints"),
  };

  const { error } = await supabase.from("streams").insert([newStream]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/user/classroom/class/${formData.get("classroomId")}`);
  revalidatePath(
    `/user/classroom/class/${formData.get("classroomId")}/classwork`,
  );

  return {
    success: true,
    message: `${(formData.get("streamType") as string) === "stream" ? "Post" : capitalizeFirstLetter((formData.get("streamType") as string) ?? "")} published!`,
  };
}

export async function updateClassStreamPost(
  audience: string[],
  audienceIsAll: boolean,
  curUrlLinks: string[],
  curAttachments: string[],
  formData: FormData,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentStream = await getClassStreamByStreamId(
    formData.get("streamId") as string,
  );

  if (!currentStream)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  if (currentStream.author !== session.user.id)
    return {
      success: false,
      message: "This class stream can only be edited by the one who posted it.",
    };

  const newAttachments = formData.getAll("attachments");
  const newUrlLinks = formData.getAll("links");
  const newCaption = formData.get("caption");
  const newTitle = formData.get("title");
  const newDueDate = formData.get("dueDate");
  const newPoints = formData.get("totalPoints");
  const newAcceptingSubmissions =
    formData.get("acceptingSubmissions") === "true";
  const newCloseSubmissionsAfterDueDate =
    formData.get("closeSubmissionsAfterDueDate") === "true";

  if (
    currentStream.caption !== newCaption ||
    currentStream.announceToAll !== audienceIsAll ||
    newAttachments.length ||
    newUrlLinks.length ||
    currentStream.points !== newPoints ||
    currentStream.title !== newTitle ||
    newAcceptingSubmissions !== currentStream.acceptingSubmissions ||
    newCloseSubmissionsAfterDueDate !==
      currentStream.closeSubmissionsAfterDueDate ||
    formData.get("hasDueDate") !== currentStream.hasDueDate ||
    (newDueDate === null
      ? "1970-01-01T00:00:00+00:00"
      : format(
          subHours(
            parse(newDueDate as string, "yyyy-MM-dd'T'HH:mm", new Date()),
            8,
          ),
          "yyyy-MM-dd'T'HH:mm:ss",
        ) + "+00:00") !== currentStream.dueDate ||
    arraysAreEqual(audience, currentStream.announceTo) === false ||
    arraysAreEqual(curAttachments, currentStream.attachment) === false ||
    arraysAreEqual(curUrlLinks, currentStream.links) === false
  ) {
    const removedAttachments = currentStream.attachment.filter(
      (attachment) => !curAttachments.includes(attachment),
    );
    if (removedAttachments.length) {
      const filePath = removedAttachments.map((file) =>
        extractStreamFilePath(file),
      );
      await deleteFileFromBucket("streams", filePath);
    }

    const postAttachments = Array.isArray(newAttachments)
      ? await Promise.all(
          newAttachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "streams",
                formData.get("classroomId") as string,
                attachment,
              );
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatedStream = {
      title: newTitle,
      caption: formData.get("caption"),
      announceTo: audience,
      announceToAll: audienceIsAll,
      attachment: postAttachments.concat(curAttachments),
      links: newUrlLinks.concat(curUrlLinks),
      hasDueDate: newDueDate ? "true" : "false",
      dueDate: format(
        formData.get("dueDate") as string,
        "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
      ),
      points: newPoints,
      acceptingSubmissions: newAcceptingSubmissions,
      closeSubmissionsAfterDueDate: newCloseSubmissionsAfterDueDate,
      updatedPost: true,
    };

    const { error } = await supabase
      .from("streams")
      .update([updatedStream])
      .eq("id", formData.get("streamId"));

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath(`/user/classroom/class/${formData.get("classroomId")}`);
    revalidatePath(
      `/user/classroom/class/${formData.get("classroomId")}/classwork`,
    );

    return {
      success: true,
      message: `${(formData.get("streamType") as string) === "stream" ? "Post" : capitalizeFirstLetter((formData.get("streamType") as string) ?? "")} updated successfully! `,
    };
  }
  return {
    success: true,
    message: `No changes were made to the ${(formData.get("streamType") as string) === "stream" ? "post" : (formData.get("streamType") as string)}.`,
  };
}

export async function deleteClassStreamPost(streamId: string) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This post doesn't exist in this class.");

  const classroom = await getClassByClassId(stream.classroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  if (
    !(
      stream.author === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this post.");

  await deleteAllClassStreamComments(streamId);

  if (stream.attachment.length) {
    const filePath = stream.attachment.map((file) =>
      extractStreamFilePath(file),
    );
    await deleteFileFromBucket("streams", filePath);
  }

  const { error } = await supabase.from("streams").delete().eq("id", streamId);

  revalidatePath(`/user/classroom/class/${classroom.classroomId}`);
  revalidatePath(`/user/classroom/class/${classroom.classroomId}/classwork`);

  if (error) throw new Error(error.message);
}

export async function deleteAllClassStreamComments(streamId: string) {
  const { error } = await supabase
    .from("classComments")
    .delete()
    .eq("streamId", streamId);

  if (error) throw new Error(error.message);
}

export async function deleteStreamComment(
  clasroomId: string,
  streamId: string,
  commentId: string,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const classroom = await getClassByClassId(clasroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This post doesn't exist in this class.");

  const comment = await getStreamCommentByCommentId(commentId);

  if (!comment) throw new Error("This comment doesn't exist on this post.");

  if (
    !(
      comment.author === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this comment.");

  const { error } = await supabase
    .from("classComments")
    .delete()
    .eq("id", commentId)
    .eq("streamId", streamId);

  if (error) throw new Error(error.message);
}

export async function addCommentToStream(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const classroom = await getClassByClassId(
    formData.get("classroomId") as string,
  );

  if (!classroom) throw new Error("This class doesn't exist.");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    formData.get("classroomId") as string,
  );

  if (
    !(
      classroom.teacherId === session.user.id ||
      enrolledClass ||
      classroom.allowStudentsToComment
    )
  ) {
    throw new Error("You don't have permission to comment on this post.");
  }

  const newComment = {
    author: session.user.id,
    authorName: session.user.name,
    authorAvatar: session.user.image,
    comment: formData.get("comment"),
    classroomId: formData.get("classroomId"),
    streamId: formData.get("streamId"),
  };

  const { error } = await supabase.from("classComments").insert([newComment]);

  if (error) throw new Error(error.message);
}

export async function addPrivateComment(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const classroomId = formData.get("classroomId") as string;
  const streamId = formData.get("streamId") as string;
  const userId = formData.get("userId") as string;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(classroomId);

  if (!(classroom?.teacherId === session.user.id || enrolledClass)) {
    throw new Error("You don't have permission to comment.");
  }

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This stream doesn't exist.");

  if (
    !(
      stream.announceToAll ||
      session.user.id === classroom.teacherId ||
      stream.announceTo.includes(session.user.id)
    )
  ) {
    throw new Error("You don't have permission to comment on this classwork.");
  }

  const newPrivateComment = {
    author: session.user.id,
    authorName: session.user.name,
    authorAvatar: session.user.image,
    toUserId:
      session.user.id === classroom.teacherId ? userId : classroom.teacherId,
    comment: formData.get("comment"),
    classroomId: formData.get("classroomId"),
    streamId: formData.get("streamId"),
  };

  const { error } = await supabase
    .from("classPrivateComments")
    .insert([newPrivateComment]);

  if (error) throw new Error(error.message);
}

export async function deletePrivateComment(
  clasroomId: string,
  streamId: string,
  commentId: string,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const classroom = await getClassByClassId(clasroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This post doesn't exist in this class.");

  const comment = await getStreamPrivateCommentByCommentId(commentId);

  if (!comment) throw new Error("This comment doesn't exist on this post.");

  if (
    !(
      comment.author === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this comment.");

  const { error } = await supabase
    .from("classPrivateComments")
    .delete()
    .eq("id", commentId)
    .eq("streamId", streamId);

  if (error) throw new Error(error.message);
}

export async function addUserToClass(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin" || session.user.role === "student") {
    return {
      success: false,
      message: "Only teachers can add users to this class.",
    };
  }

  const classId = formData.get("classId") as string;
  const userEmail = formData.get("email") as string;

  const classroom = await getClassByClassId(classId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  const user = await getUserByEmail(userEmail);

  if (!user)
    return {
      success: false,
      message: "No account found for this email address.",
    };

  if (classroom.teacherId === user.id)
    return {
      success: false,
      message: "This user is already a member of this class.",
    };

  if (user.role === "admin")
    return {
      success: false,
      message: "This class can only include students and teachers.",
    };

  const enrolledClass = await getEnrolledClassByUserAndClassId(
    user.id,
    classId,
  );

  if (enrolledClass)
    return {
      success: false,
      message: "This user is already a member of this class.",
    };

  const newClass = {
    userId: user.id,
    userName: user.fullName,
    userAvatar: user.avatar,
    classroomId: classroom.classroomId,
    subject: classroom.subject,
    className: classroom.className,
    section: classroom.section,
    classCardBackgroundColor: classroom.classCardBackgroundColor,
    illustrationIndex: classroom.illustrationIndex,
    teacherName: classroom.teacherName,
    teacherAvatar: classroom.teacherAvatar,
  };

  const { error } = await supabase.from("enrolledClass").insert([newClass]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/user/classroom/`);

  return {
    success: true,
    message: "User successfully added to class!",
  };
}

export async function uploadAttachments(
  bucketName: string,
  classroomId: string,
  file: File,
) {
  if (file.name !== "undefined") {
    const [name, extension] = file.name.split(/\.(?=[^\.]+$)/);
    const { data: attachment, error } = await supabase.storage
      .from(`${bucketName}/${classroomId}`)
      .upload(`${name}_${uuidv4()}.${extension}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(`${bucketName}/${classroomId}`)
      .getPublicUrl(attachment.path);
    return publicUrl;
  }
}

export async function submitClasswork(
  classId: string,
  streamId: string,
  formData: FormData,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Admins and guests are not allowed to post to the class stream.",
    };
  }

  const classroom = await getClassByClassId(classId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream)
    return {
      success: false,
      message: "This stream does not exist.",
    };

  if (!(stream.announceToAll || stream.announceTo.includes(session.user.id)))
    return {
      success: false,
      message: "You can't submit",
    };

  const attachments = formData.getAll("attachments");
  const postAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments("classworks", classId, attachment);
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newClasswork = {
    userId: session.user.id,
    userName: session.user.name,
    userAvatar: session.user.image,
    classroomId: classId,
    classroomName: classroom.className,
    streamCreated: stream.created_at,
    classworkTitle: stream.title,
    streamId,
    attachment: postAttachments,
    links: formData.getAll("links"),
    turnedInDate: new Date(),
    isTurnedIn: true,
  };

  const { error } = await supabase.from("classworks").insert([newClasswork]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/user/classroom/class/${classId}/stream/${streamId}`);

  return { success: true, message: "Classwork submitted!" };
}

export async function updateClasswork(
  curUrlLinks: string[],
  curAttachments: string[],
  formData: FormData,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentClasswork = await getClassworkByClassAndUserId(
    session.user.id,
    formData.get("classroomId") as string,
    formData.get("streamId") as string,
  );

  if (!currentClasswork)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  const newAttachments = formData.getAll("attachments");
  const newUrlLinks = formData.getAll("links");
  const newIsTurnedIn = formData.get("isTurned") === "true";

  if (
    newAttachments.length ||
    newUrlLinks.length ||
    newIsTurnedIn === currentClasswork.isTurnedIn ||
    arraysAreEqual(curAttachments, currentClasswork.attachment) === false ||
    arraysAreEqual(curUrlLinks, currentClasswork.links) === false
  ) {
    const removedAttachments = currentClasswork.attachment.filter(
      (attachment) => !curAttachments.includes(attachment),
    );
    if (removedAttachments.length) {
      const filePath = removedAttachments.map((file) =>
        extractClassworkFilePath(file),
      );
      await deleteFileFromBucket("classworks", filePath);
    }

    const postAttachments = Array.isArray(newAttachments)
      ? await Promise.all(
          newAttachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "classworks",
                formData.get("classroomId") as string,
                attachment,
              );
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatedStream = {
      attachment: postAttachments.concat(curAttachments),
      links: newUrlLinks.concat(curUrlLinks),
      turnedInDate: new Date(),
      isTurnedIn: true,
    };

    const { error } = await supabase
      .from("classworks")
      .update([updatedStream])
      .eq("id", formData.get("classworkId"));

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath(
      `/user/classroom/class/${formData.get("classroomId")}/stream/${formData.get("streamId")}`,
    );

    return { success: true, message: "Classwork updated successfully!" };
  }
  return {
    success: true,
    message: "No changes were made to the classwork.",
  };
}

export async function unsubmitClasswork(
  classworkId: string,
  classroomId: string,
  streamId: string,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentClasswork = await getClassworkByClassAndUserId(
    session.user.id,
    classroomId,
    streamId,
  );

  if (!currentClasswork)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  const updatedStream = {
    isTurnedIn: false,
  };

  const { error } = await supabase
    .from("classworks")
    .update([updatedStream])
    .eq("id", classworkId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/user/classroom/class/${classroomId}/stream/${streamId}`);

  return { success: true, message: "Your classwork has been unsubmitted." };
}

export async function addGradeClasswork(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "teacher") {
    return {
      success: false,
      message: "Only a teacher can add a grade.",
    };
  }

  const userId = formData.get("userId") as string;
  const streamId = formData.get("streamId") as string;
  const classId = formData.get("classroomId") as string;
  const classworkId = formData.get("classworkId") as string;
  const userPoints = formData.get("userPoints") as string;

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream)
    return {
      success: false,
      message: "This classwork doesn't exist in this class.",
    };

  if (!stream.announceToAll && !stream.announceTo.includes(userId))
    return {
      success: false,
      message: "This user isn't assigned in this classwork.",
    };

  const currentClasswork = await getClassworkByClassAndUserId(
    userId,
    classId,
    streamId,
  );

  if (!currentClasswork) {
    const newClasswork = await createEmptyClasswork(
      userId,
      classId,
      streamId,
      userPoints,
    );
    if (!newClasswork)
      return { success: false, message: "User can not be added." };

    revalidatePath(`/user/classroom/class/${classId}/stream/${streamId}`);

    return { success: true, message: "Grade has been added to this user." };
  }

  if (currentClasswork?.userPoints !== userPoints) {
    const updatedStream = {
      userPoints,
      isGraded: true,
    };

    const { error } = await supabase
      .from("classworks")
      .update([updatedStream])
      .eq("id", classworkId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath(`/user/classroom/class/${classId}/stream/${streamId}`);

    return { success: true, message: "Grade has been added to this user." };
  }
  return { success: true, message: "No changes were made to the classwork." };
}

export async function createEmptyClasswork(
  userId: string,
  classId: string,
  streamId: string,
  userPoints?: string,
) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const classroom = await getClassByClassId(classId);

  if (!classroom) throw new Error("This class does not exist.");

  if (session.user?.id !== classroom.teacherId)
    throw new Error("Only teachers can do this operation.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This stream does not exist.");

  const user = await getUserByUserId(userId);

  if (!user) throw new Error("This user does not exist.");

  const enrolledUser = await getEnrolledClassByUserAndClassId(user.id, classId);

  if (!enrolledUser) throw new Error("This user is not enrolled in this class");

  const newClasswork = {
    userId: user.id,
    classroomId: classId,
    streamId,
    attachment: [],
    links: [],
    userPoints,
    isGraded: Number(userPoints) >= 0 ? true : false,
    classroomName: classroom.className,
    streamCreated: stream.created_at,
    classworkTitle: stream.title,
    userName: user.fullName,
    userAvatar: user.avatar,
    isTurnedIn: false,
  };

  const { data, error } = await supabase
    .from("classworks")
    .insert([newClasswork])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}