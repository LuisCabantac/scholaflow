import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { inferAdditionalFields } from "better-auth/client/plugins";

import { db } from "@/drizzle/index";
import { schema } from "@/drizzle/schema";

import { deleteNote } from "@/lib/notes-actions";
import { extractAvatarFilePath } from "@/lib/utils";
import { getUserByUserId } from "@/lib/user-service";
import { getAllNotesBySession } from "@/lib/notes-service";
import { getAllClassesStreamByUserId } from "@/lib/stream-service";
import {
  deleteAllCommentsByUserId,
  deleteAllMessagesByUserId,
  deleteAllPrivateCommentsByUserId,
  deleteClass,
  deleteClassStreamPost,
  deleteEnrolledClassbyClassAndEnrolledClassId,
} from "@/lib/classroom-actions";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/lib/classroom-service";
import {
  deleteFileFromBucket,
  removeRoleRequestByUserId,
} from "@/lib/user-management-actions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (!session) throw new Error("You must be logged in.");

        const userData = await getUserByUserId(user.id);
        if (!userData) throw new Error("User does not exist.");

        if (!(session.user.id === userData.id || session.user.role === "admin"))
          throw new Error("You do not have permission to close this account.");

        await deleteAllMessagesByUserId(user.id);

        await deleteAllCommentsByUserId(user.id);

        await deleteAllPrivateCommentsByUserId(user.id);

        const posts = await getAllClassesStreamByUserId(user.id);
        if (posts?.length) {
          for (const post of posts) {
            await deleteClassStreamPost(post.id);
          }
        }

        const enrolledClasses = await getAllEnrolledClassesByUserId(user.id);
        if (enrolledClasses?.length) {
          for (const enrolledClass of enrolledClasses) {
            await deleteEnrolledClassbyClassAndEnrolledClassId(
              enrolledClass.id,
              enrolledClass.classId,
            );
          }
        }

        const createdClasses = await getAllClassesByTeacherId(user.id);
        if (createdClasses?.length) {
          for (const createdClass of createdClasses) {
            await deleteClass(createdClass.id);
          }
        }

        const allNotes = await getAllNotesBySession();
        if (allNotes?.length) {
          for (const note of allNotes) {
            await deleteNote(note.id);
          }
        }

        await removeRoleRequestByUserId(user.id);

        if (
          user.image &&
          !user.image.startsWith("https://lh3.googleusercontent.com/")
        ) {
          const filePath = extractAvatarFilePath(user.image);
          await deleteFileFromBucket("avatars", filePath);
        }
      },
    },
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
      },
      schoolName: {
        type: "string",
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
          defaultValue: "student",
        },
        schoolName: {
          type: "string",
          required: false,
          defaultValue: null,
        },
      },
    }),
    nextCookies(),
  ],
});
