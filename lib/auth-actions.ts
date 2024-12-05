"use server";

import { signIn, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  generateVerificationToken,
  getUserByEmail,
  getVerificationToken,
  getVerificationTokenByToken,
} from "@/lib/data-service";

interface ICheckToken {
  id: string;
  email: string;
  token: string;
  expires: string;
}

export interface IVerification {
  email: string;
  token: string;
  expires: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fullNameRegex =
  /^[A-Za-z]+([' -]?[A-Za-z]+)* [A-Za-z]+([' -]?[A-Za-z]+)*$/;

export async function signInCredentialsAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await getUserByEmail(email);
  if (user) {
    if (!user.emailVerified)
      return {
        success: false,
        message:
          "This email address isn't verified yet. Please check your inbox for a verification email and click the link to activate your account.",
      };
    if (user.password === password) {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/user/classroom?toast=Signed+in+successfully!",
      });
      return { success: true, message: "Signed in successfully!" };
    } else {
      return {
        success: false,
        message: "Incorrect password. Please try again.",
      };
    }
  } else
    return {
      success: false,
      message:
        "No account found with that email address. Double-check your spelling or sign up for a new account.",
    };
}

export async function signInGoogleAction() {
  await signIn("google", {
    redirectTo: "/user/classroom?toast=Signed+in+successfully!",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function createUser(newUser: object) {
  const { data, error } = await supabase.from("users").insert([newUser]);

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

export async function createVerificationToken(newVerification: {
  email: string;
  token: string;
}): Promise<IVerification | null> {
  const { data, error } = await supabase
    .from("verificationTokens")
    .insert([newVerification])
    .select()
    .single();

  if (error) {
    throw new Error("Verification Token could not be created");
  }
  return data;
}

export async function checkVerificationToken(formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  const data = await getVerificationToken(email);

  return (data as ICheckToken[])[0].token === otp;
}

export async function signUpAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullNameRegex.test(fullName))
    return {
      success: false,
      message: "Please enter a valid full name.",
    };

  if (!emailRegex.test(email))
    return {
      success: false,
      message: "Invalid email address.",
    };

  if (password.length < 8)
    return {
      success: false,
      message: "Your password must be a minimum of 8 characters in length.",
    };

  const userExist = await getUserByEmail(email);

  if (userExist)
    return { success: false, message: "This email is already in use." };

  const newUser = {
    fullName,
    email,
    password,
  };

  const { error } = await supabase.from("users").insert([newUser]);

  const verification = await generateVerificationToken(email);

  if (!verification)
    return {
      success: false,
      message:
        "We encountered a problem creating your account. Please try again.",
    };

  if (error)
    return {
      success: false,
      message:
        "We encountered a problem creating your account. Please try again.",
      token: "",
      email: "",
    };

  return {
    success: true,
    message: `Your account is nearly ready! Check your email for a verification link to activate your account.`,
    token: verification.token,
    email,
  };
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

  // const hasExpired = new Date(tokenData.expires) < new Date();

  // if (hasExpired)
  //   return {
  //     success: false,
  //     message: "This link has expired. Please request a new verification link.",
  //   };

  const user = await getUserByEmail(tokenData.email);

  if (!user)
    return {
      success: false,
      message:
        "No account found for this email address. Please double-check your spelling or create a new account.",
    };

  const { error: userUpdateError } = await supabase
    .from("users")
    .update([{ emailVerified: true }])
    .eq("id", user.id);

  if (userUpdateError)
    return { success: false, message: userUpdateError.message };

  const { error: tokenDeleteError } = await supabase
    .from("verificationTokens")
    .delete()
    .eq("email", user.email);

  if (tokenDeleteError)
    return { success: false, message: tokenDeleteError.message };

  return {
    success: true,
    message: "Your email is confirmed! Your learning journey begins now.",
  };
}
