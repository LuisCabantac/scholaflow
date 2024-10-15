import noPosts from "@/public/app/no_posts.svg";
import Image from "next/image";

export default function NoAnnouncement() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-2 md:h-[25rem]">
      <div className="relative w-[15rem] md:w-[20rem]">
        <Image src={noPosts} alt="no posts" className="object-cover" />
      </div>
      <p className="font-medium md:text-lg">
        No announcements have been made yet.
      </p>
    </div>
  );
}
