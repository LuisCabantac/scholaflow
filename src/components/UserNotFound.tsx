import Image from "next/image";

import noUsers from "@/public/app/no_user.svg";

export default function UserNotFound() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <Image src={noUsers} alt="no classes" className="object-cover" />
      </div>
      <p className="text-base font-medium">User not found.</p>
    </div>
  );
}
