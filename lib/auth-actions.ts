"use server";

import { signIn, signOut } from "./auth";
import { getUser, getUserEmail, getVerificationToken } from "./data-service";
import { supabase } from "./supabase";

interface ICheckToken {
  id: string;
  email: string;
  token: string;
  expires: string;
}

export async function signInCredentialsAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await getUser(email);
  if (user) {
    if (user.password === password) {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/user/dashboard?toast=Signed+in+successfully!",
      });
      return false;
    } else {
      return true;
    }
  } else return true;
}

export async function signInGoogleAction() {
  await signIn("google", {
    redirectTo: "/user/dashboard?toast=Signed+in+successfully!",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function createUser(newGuest: object) {
  const { data, error } = await supabase.from("users").insert([newGuest]);

  if (error) {
    throw new Error("User could not be created");
  }

  return data;
}

export async function checkEmail(formData: FormData) {
  const email = formData.get("email") as string;

  const user = await getUserEmail(email);
  if (!user) {
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

// export async function signUpAction(formData: FormData) {
//   const fullName = formData.get("fullName") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const otp = formData.get("otp") as string;

//   const data = await getVerificationToken(email);

//   console.log(data);

//   if (otp === verificationToken[0].token) {
//     await deleteVerificationToken(email);
//     await createUser({
//       email: email,
//       fullName: fullName,
//       password: password,
//       role: "student",
//       emailVerified: true,
//     });
//   }
// }

// const user = await getUserEmail(email);
// if (!user && email) {
//   const verificationToken = await generateVerificationToken(email);

//   await sendVerificationEmail(email, verificationToken[0].token);

//   console.log(otp, verificationToken[0].token);
//   if (otp === verificationToken[0].token) {
//     await deleteVerificationToken(email);
//     await createUser({
//       email: email,
//       fullName: fullName,
//       password: password,
//       role: "student",
//       emailVerified: true,
//     });
//   }

//   return {
//     type: "verification",
//     success: {
//       status: true,
//       message: "Email Verification was sent",
//     },
//   };
// } else {
//   return {
//     type: "email",
//     success: {
//       status: false,
//       message: "This email has already been taken.",
//     },
//   };
// }

// export async function signUpAction(formData: FormData, otp: string) {
//   const fullName = formData.get("fullName") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   const user = await getUserEmail(email);
//   if (!user && email) {
//     const verificationToken = await generateVerificationToken(email);

//     await sendVerificationEmail(email, verificationToken[0].token);

//     console.log(otp, verificationToken[0].token);
//     if (otp === verificationToken[0].token) {
//       await deleteVerificationToken(email);
//       await createUser({
//         email: email,
//         fullName: fullName,
//         password: password,
//         role: "student",
//         emailVerified: true,
//       });
//     }

//     return {
//       type: "verification",
//       success: {
//         status: true,
//         message: "Email Verification was sent",
//       },
//     };
//   } else {
//     return {
//       type: "email",
//       success: {
//         status: false,
//         message: "This email has already been taken.",
//       },
//     };
//   }
// }
