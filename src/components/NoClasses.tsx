import Image from "next/image";
import noPosts from "@/public/app/no_classes.svg";

export default function NoClasses() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <Image
          src={noPosts}
          alt="no classes"
          className="select-none object-cover"
        />
      </div>
      <p className="text-base font-medium">Add a class to get started.</p>
    </div>
  );
}
