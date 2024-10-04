import Image from "next/image";
import Link from "next/link";

import { FontType } from "@/app/layout";

import scholaflowLogo from "@/public/scholaflow_logo.png";

export default function Logo({ font }: { font: FontType }) {
  return (
    <Link href="/" className="flex items-center gap-1">
      <div className="relative h-7 w-7 md:h-8 md:w-8">
        <Image src={scholaflowLogo} alt="logo" fill className="object-cover" />
      </div>
      <p
        className={`${font.className} text-xl font-bold text-[#22317c] md:text-2xl`}
      >
        ScholaFlow
      </p>
    </Link>
  );
}
