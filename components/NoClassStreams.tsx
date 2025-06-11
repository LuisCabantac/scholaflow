import Image from "next/image";
import noStreams from "@/public/app/no_streams.svg";

export default function NoClassStreams() {
  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[20rem] md:gap-2">
      <div className="relative w-[10rem] md:w-[15rem]">
        <Image
          src={noStreams}
          alt="no classes"
          className="select-none object-cover"
        />
      </div>
      <p className="text-center text-base font-medium">
        This is where you&apos;ll see updates for this class.
      </p>
    </div>
  );
}
