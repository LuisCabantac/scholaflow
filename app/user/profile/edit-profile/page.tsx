import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserByUserId } from "@/lib/data-service";
import { hasUser } from "@/lib/utils";

function handleFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);
  let firstName, lastName, middleName;

  if (nameParts.length === 1) {
    firstName = nameParts[0];
    lastName = "";
    middleName = "";
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
    middleName = "";
  } else {
    firstName = nameParts.slice(0, -2).join(" ");
    lastName = nameParts[nameParts.length - 1];
    middleName = nameParts[nameParts.length - 2];
  }

  return {
    firstName,
    middleName: middleName || "",
    lastName,
  };
}

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const user = await getUserByUserId(session.user.id);

  if (!user) return redirect("/signin");

  const {
    // role,
    email: currentUserEmail,
    fullName,
    // password,
    // school,
    // course,
    // gender,
    avatar,
    updatedProfile,
  } = user;

  const { firstName, middleName, lastName } = handleFullName(fullName);

  return (
    <section className="mt-10">
      <div className="relative h-40 w-40 rounded-full">
        <Image
          src={avatar}
          alt={`${fullName}'s photo`}
          fill
          className="h-full w-full rounded-full"
        />
      </div>
      <form className="flex flex-col items-start justify-center">
        <div className="my-4 grid gap-4">
          <div className="flex gap-4">
            <div className="grid gap-2">
              <label htmlFor="firstName" className="font-medium">
                First Name
              </label>
              <input
                type="text"
                disabled={updatedProfile}
                name="firstName"
                defaultValue={firstName}
                placeholder="First name"
                className="rounded-md px-6 py-3 disabled:cursor-not-allowed disabled:bg-[#e0e6f5]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="middleName" className="font-medium">
                Middle Name
              </label>
              <input
                type="text"
                disabled={updatedProfile}
                name="middleName"
                defaultValue={middleName}
                className="rounded-md px-6 py-3 disabled:cursor-not-allowed disabled:bg-[#e0e6f5]"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="lastName" className="font-medium">
            Last Name
          </label>
          <input
            type="text"
            disabled={updatedProfile}
            name="lastName"
            defaultValue={lastName}
            className="rounded-md px-6 py-3 disabled:cursor-not-allowed disabled:bg-[#e0e6f5]"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="font-medium">
            Email
          </label>

          <input
            id="email"
            disabled
            type="text"
            name="email"
            value={currentUserEmail}
            className="rounded-md px-6 py-3 disabled:cursor-not-allowed disabled:bg-[#e0e6f5]"
          />
        </div>
      </form>
    </section>
  );
}
