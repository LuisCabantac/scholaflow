"use server";

import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { auth } from "@/lib/auth";
import { deleteNote } from "@/lib/notes-actions";
import { extractAvatarFilePath } from "@/lib/utils";
import { getAllNotesBySession } from "@/lib/notes-service";
import { nanoidId, uuidv4Id, Verification } from "@/lib/schema";
import { getAllClassesStreamByUserId } from "@/lib/stream-service";
import {
  getAccountByUserId,
  getUserByEmail,
  getUserIdById,
} from "@/lib/user-service";
import { account, session, user, verification } from "@/drizzle/schema";
import {
  generateVerificationToken,
  getVerificationToken,
  getVerificationTokenByToken,
} from "@/lib/auth-service";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/lib/classroom-service";
import {
  deleteFileFromBucket,
  removeRoleRequestByUserId,
} from "@/lib/user-management-actions";
import {
  deleteAllCommentsByUserId,
  deleteAllMessagesByUserId,
  deleteAllPrivateCommentsByUserId,
  deleteClass,
  deleteClassStreamPost,
  deleteEnrolledClassbyClassAndEnrolledClassId,
} from "@/lib/classroom-actions";

// Auth.js Credential SignIn
// export async function signInCredentialsAction(formData: FormData) {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   const user = await getUserByEmail(email);

//   if (!user)
//     return {
//       success: false,
//       message:
//         "No account found with that email address. Double-check your spelling or sign up for a new account.",
//     };

//   if (!user.emailVerified)
//     return {
//       success: false,
//       message:
//         "This email address isn't verified yet. Please check your inbox for a verification email and click the link to activate your account.",
//     };

//   if (user.password !== password)
//     return {
//       success: false,
//       message: "Incorrect password. Please try again.",
//     };

//   return { success: true, message: "Signed in successfully!" };
// }

// Auth.js Credential SignUp
// export async function signUpAction(formData: FormData) {
//   const fullName = formData.get("name") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   if (!fullNameRegex.test(fullName))
//     return {
//       success: false,
//       message: "Please enter a valid full name.",
//     };

//   if (!emailRegex.test(email))
//     return {
//       success: false,
//       message: "Invalid email address.",
//     };

//   if (password.length < 8)
//     return {
//       success: false,
//       message: "Your password must be a minimum of 8 characters in length.",
//     };

//   const userExist = await getUserByEmail(email);

//   if (userExist)
//     return { success: false, message: "This email is already in use." };

//   const newUser = {
//     fullName,
//     email,
//     password,
//   };

//   const { error } = await supabase.from("user").insert([newUser]);

//   const verification = await generateVerificationToken(email);

//   if (!verification)
//     return {
//       success: false,
//       message:
//         "We encountered a problem creating your account. Please try again.",
//     };

//   if (error)
//     return {
//       success: false,
//       message:
//         "We encountered a problem creating your account. Please try again.",
//       token: "",
//       email: "",
//     };

//   return {
//     success: true,
//     message: `Your account is nearly ready! Check your email for a verification link to activate your account.`,
//     token: verification.value,
//     email: verification.identifier,
//   };
// }

// export async function createUser(newUser: object) {
//   const { data, error } = await supabase.from("user").insert([newUser]);

//   if (error) {
//     throw new Error("User could not be created");
//   }

//   return data;
// }

export async function checkEmail(formData: FormData): Promise<{
  type: string;
  success: {
    status: boolean;
    message: string;
  };
}> {
  const email = formData.get("email") as string;

  const user = await getUserByEmail(email);
  if (!user) {
    return {
      type: "verification",
      success: {
        status: true,
        message: "Email Verification was sent",
      },
    };
  } else {
    return {
      type: "email",
      success: {
        status: false,
        message: "This email has already been taken.",
      },
    };
  }
}

export async function deleteVerificationToken(email: string): Promise<void> {
  await db.delete(verification).where(eq(verification.identifier, email));
}

export async function createVerificationToken(
  email: string,
  token: string,
  expiresAt: Date,
): Promise<Verification | null> {
  const [data] = await db
    .insert(verification)
    .values({
      id: uuidv4(),
      identifier: email,
      value: token,
      expiresAt,
    })
    .returning();

  if (!data) {
    throw new Error("Verification Token could not be created");
  }

  return data;
}

export async function checkVerificationToken(
  email: string,
  tokenType: "uuid" | "nanoid",
): Promise<{
  success: boolean;
  message: string;
  data: Verification | null;
  userName: string | null;
}> {
  const existingToken = await getVerificationToken(email);

  if (
    existingToken &&
    (tokenType === "nanoid"
      ? nanoidId.safeParse(existingToken.value).success
      : uuidv4Id.safeParse(existingToken.value).success)
  ) {
    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (!hasExpired) {
      return {
        success: false,
        message:
          "A verification email was already sent. Please check your inbox or wait for the current link to expire before requesting a new one.",
        data: null,
        userName: null,
      };
    }
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser)
    return {
      success: false,
      message:
        "The email address you entered does not exist in our system. Please check your email and try again, or create a new account.",
      data: null,
      userName: null,
    };

  if (tokenType === "nanoid") {
    const account = await getAccountByUserId(existingUser.id);

    if (account && account.providerId === "google") {
      return {
        success: false,
        message:
          "Password reset is not available for Google accounts. Please sign in and visit your profile settings to set up a password for email/password login.",
        data: null,
        userName: null,
      };
    }
  }

  const verification = await generateVerificationToken(email, tokenType);

  if (!verification) {
    return {
      success: false,
      message:
        "Failed to generate verification token. Please try again later or contact support if the issue persists.",
      data: null,
      userName: null,
    };
  }

  return {
    success: true,
    message:
      "Verification token generated successfully. Please check your email for the verification link.",
    data: verification,
    userName: existingUser.name,
  };
}

export async function verifyEmailVerification(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  const tokenData = await getVerificationTokenByToken(token);

  if (!tokenData)
    return {
      success: false,
      message:
        "Invalid link. This verification link may be incorrect or expired. Please request a new one.",
    };

  const hasExpired = new Date(tokenData.expiresAt) < new Date();

  if (hasExpired) {
    await db
      .delete(verification)
      .where(eq(verification.identifier, tokenData.identifier));

    return {
      success: false,
      message: "This link has expired. Please request a new verification link.",
    };
  }

  const existingUser = await getUserIdById(tokenData.identifier);

  if (!existingUser)
    return {
      success: false,
      message:
        "No account found for this email address. Please double-check your spelling or create a new account.",
    };

  const [updatedUser] = await db
    .update(user)
    .set({ emailVerified: true })
    .where(eq(user.id, existingUser.id))
    .returning();

  if (!updatedUser)
    return {
      success: false,
      message:
        "Failed to verify your email. Please try again or contact support if the problem persists.",
    };

  await db
    .delete(verification)
    .where(eq(verification.identifier, tokenData.identifier));

  return {
    success: true,
    message: "Your email is confirmed! Your learning journey begins now.",
  };
}

export async function closeUserAccount(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  const tokenData = await getVerificationTokenByToken(token);

  if (!tokenData)
    return {
      success: false,
      message:
        "Invalid link. This verification link may be incorrect or expired. Please request a new one.",
    };

  const hasExpired = new Date(tokenData.expiresAt) < new Date();

  if (hasExpired) {
    await db
      .delete(verification)
      .where(eq(verification.identifier, tokenData.identifier));

    return {
      success: false,
      message: "This link has expired. Please request a new verification link.",
    };
  }

  const existingUser = await getUserByEmail(tokenData.identifier);

  if (!existingUser)
    return {
      success: false,
      message:
        "No account found for this email address. Please double-check your spelling or create a new account.",
    };

  await deleteAllMessagesByUserId(existingUser.id);

  await deleteAllCommentsByUserId(existingUser.id);

  await deleteAllPrivateCommentsByUserId(existingUser.id);

  const posts = await getAllClassesStreamByUserId(existingUser.id);
  if (posts?.length) {
    for (const post of posts) {
      await deleteClassStreamPost(post.id);
    }
  }

  const enrolledClasses = await getAllEnrolledClassesByUserId(existingUser.id);
  if (enrolledClasses?.length) {
    for (const enrolledClass of enrolledClasses) {
      await deleteEnrolledClassbyClassAndEnrolledClassId(
        enrolledClass.id,
        enrolledClass.classId,
      );
    }
  }

  const createdClasses = await getAllClassesByTeacherId(existingUser.id);
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

  await removeRoleRequestByUserId(existingUser.id);

  if (
    existingUser.image &&
    !existingUser.image.startsWith("https://lh3.googleusercontent.com/")
  ) {
    const filePath = extractAvatarFilePath(existingUser.image);
    await deleteFileFromBucket("avatars", filePath);
  }

  await db.delete(session).where(eq(session.userId, existingUser.id));

  const [existingAccount] = await db
    .delete(account)
    .where(eq(account.userId, existingUser.id))
    .returning();

  if (!existingAccount)
    return {
      success: false,
      message:
        "Failed to delete user account. Please try again or contact support.",
    };

  const [existingUserData] = await db
    .delete(user)
    .where(eq(user.id, existingUser.id))
    .returning();

  if (!existingUserData)
    return {
      success: false,
      message:
        "Failed to delete user account. Please try again or contact support.",
    };

  await db
    .delete(verification)
    .where(eq(verification.identifier, tokenData.identifier))
    .returning();

  return {
    success: true,
    message:
      "Your account has been successfully deleted. We're sorry to see you go!",
  };
}

export async function updateUserPassword(
  token: string,
  values: { password: string },
): Promise<{
  success: boolean;
  message: string;
}> {
  const tokenData = await getVerificationTokenByToken(token);

  if (!tokenData)
    return {
      success: false,
      message:
        "Invalid link. This verification link may be incorrect or expired. Please request a new one.",
    };

  if (nanoidId.safeParse(tokenData.value).success === false)
    return {
      success: false,
      message:
        "Invalid verification token format. Please request a new password reset link.",
    };

  const hasExpired = new Date(tokenData.expiresAt) < new Date();

  if (hasExpired) {
    await db
      .delete(verification)
      .where(eq(verification.identifier, tokenData.identifier));

    return {
      success: false,
      message: "This link has expired. Please request a new verification link.",
    };
  }

  const existingUser = await getUserByEmail(tokenData.identifier);

  if (!existingUser)
    return {
      success: false,
      message:
        "No account found for this email address. Please double-check your spelling or create a new account.",
    };

  const newPassword = values.password;

  if (!newPassword)
    return {
      success: false,
      message: "Password is required. Please enter a new password.",
    };

  if (newPassword.length < 8)
    return {
      success: false,
      message: "Your password must be at least 8 characters long.",
    };

  if (newPassword.length > 20)
    return {
      success: false,
      message: "Your password must be no more than 20 characters long.",
    };

  const account = await getAccountByUserId(existingUser.id);

  if (account && account.providerId === "google") {
    return {
      success: false,
      message:
        "Password reset is not available for Google accounts. You can set a password by visiting your profile settings and editing your account details.",
    };
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(newPassword);

  await ctx.internalAdapter.updatePassword(existingUser.id, hash);

  await db
    .delete(verification)
    .where(eq(verification.identifier, tokenData.identifier));

  return {
    success: true,
    message:
      "Your password has been successfully updated. You can now sign in with your new password.",
  };
}
