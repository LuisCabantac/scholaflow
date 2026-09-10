"use client";

import Image from "next/image";
import { Quicksand } from "next/font/google";

import { FontType } from "@/app/layout";
import scholaflowLogo from "@/public/scholaflow_logo.png";

const quicksand: FontType = Quicksand({
  subsets: ["latin"],
  display: "swap",
});

export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex select-none items-center justify-start gap-1">
      <Image
        src={scholaflowLogo}
        alt="logo"
        width={200}
        height={200}
        className="h-7 w-7 flex-shrink-0 select-none object-cover md:h-8 md:w-8"
        onDragStart={(e) => e.preventDefault()}
      />
      {showText && (
        <p
          className={`${quicksand.className} cursor-default text-xl font-bold text-primary md:text-2xl`}
        >
          ScholaFlow
        </p>
      )}
    </div>
  );
}
