"use server";

import { signIn, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getUserByEmail, getVerificationToken } from "@/lib/data-service";

interface ICheckToken {
  id: string;
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
    if (user.password === password) {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/user/classroom?toast=Signed+in+successfully!",
      });
      return false;
    } else {
      return true;
    }
  } else return true;
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
    //These two are for the otp signup feature
    // const verificationToken = await generateVerificationToken(email);
    // await sendVerificationEmail(email, verificationToken[0].token);

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

export async function createVerificationToken(newVerification: object) {
  const { data, error } = await supabase
    .from("verificationTokens")
    .insert([newVerification])
    .select();

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

  if (error)
    return {
      success: false,
      message:
        "We encountered a problem creating your account. Please try again.",
    };

  return {
    success: true,
    message: "Account created! You can now start learning.",
  };
}
