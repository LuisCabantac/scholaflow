"use server";

import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { user, verification } from "@/drizzle/schema";

import {
  getUserByEmail,
  getVerificationToken,
  getVerificationTokenByToken,
} from "@/lib/data-service";

export interface IVerification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}

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

export async function createUser(newUser: object) {
  const { data, error } = await supabase.from("user").insert([newUser]);

  if (error) {
    throw new Error("User could not be created");
  }

  return data;
}

export async function checkEmail(formData: FormData) {
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

export async function deleteVerificationToken(email: string) {
  await supabase.from("verificationTokens").delete().eq("email", email);
}

export async function createVerificationToken(
  email: string,
  token: string,
  expiresAt: Date,
): Promise<IVerification | null> {
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

export async function checkVerificationToken(formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  const data = await getVerificationToken(email);

  return data.value === otp;
}

export async function newVerification(token: string): Promise<{
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
