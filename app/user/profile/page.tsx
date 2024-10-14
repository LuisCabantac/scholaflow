import Image from "next/image";

import { auth } from "@/lib/auth";
import { getUser } from "@/lib/data-service";

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
  const userEmail = session?.user?.email ?? "";
  const {
    role,
    email: currentUserEmail,
    fullName,
    password,
    school,
    course,
    gender,
    avatar,
    updatedProfile,
  } = await getUser(userEmail);

  return (
    <section className="mt-10">
      <div className="">
        <div className="relative h-40 w-40 rounded-full">
          <Image
            src={avatar}
            alt={`${fullName}'s photo`}
            fill
            className="h-full w-full rounded-full"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold">{fullName}</h2>
          <p>{userEmail}</p>
        </div>
      </div>
    </section>
  );
}
