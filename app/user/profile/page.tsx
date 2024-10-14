import Image from "next/image";

import { auth } from "@/lib/auth";
import { getUser } from "@/lib/data-service";

export default async function Page() {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  const {
    // role,
    // email: currentUserEmail,
    fullName,
    // password,
    // school,
    // course,
    // gender,
    avatar,
    // updatedProfile,
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
