import Image from "next/image";
// import { Nunito_Sans } from "next/font/google";

// import { FontType } from "@/app/layout";
import scholaflowLogo from "@/public/scholaflow_logo.png";

// const nunitoSans: FontType = Nunito_Sans({
//   subsets: ["latin"],
//   display: "swap",
// });

export default function Logo() {
  return (
    <div className="flex items-center justify-start gap-1">
      <div className="relative h-7 w-7 md:h-8 md:w-8">
        <Image src={scholaflowLogo} alt="logo" fill className="object-cover" />
      </div>
      <p className="cursor-default text-xl font-bold text-[#22317c] md:text-2xl">
        {/* <p
        className={`${nunitoSans.className} cursor-default text-xl font-bold text-[#22317c] md:text-2xl`}
      > */}
        ScholaFlow
      </p>
    </div>
  );
}
