import Image from "next/image";
import noNotes from "@/public/app/no_notes.svg";

export default function NoNotes() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <Image src={noNotes} alt="no classes" className="object-cover" />
      </div>
      <p className="text-base font-medium">Add a note to get started.</p>
    </div>
  );
}
