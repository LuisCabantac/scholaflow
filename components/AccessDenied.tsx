import Image from "next/image";
import noPosts from "@/public/app/access_denied.svg";

export default function AccessDenied() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <Image src={noPosts} alt="no posts" className="object-cover" />
      </div>
      <p className="text-base font-medium">
        Please log in with a student or teacher account to access this page.
      </p>
    </div>
  );
}
