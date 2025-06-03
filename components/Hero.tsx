import React from "react";
import Image from "next/image";

import heroImage from "@/public/landing_page/hero.png";

import Button from "@/components/Button";

export default function Hero({
  featuresSectionRef,
  onScrollToSection,
}: {
  featuresSectionRef: React.RefObject<HTMLDivElement | null>;
  onScrollToSection(ref: React.RefObject<HTMLElement | null>): void;
}) {
  return (
    <section className="z-10 flex flex-col items-center gap-10 md:gap-14">
      <div className="flex items-center justify-center gap-4 px-3 pb-10 pt-20 text-center md:px-48 md:pb-10 md:pt-14">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
          <div className="grid gap-3 md:gap-6">
            <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">
              Your All-in-One Learning Platform
            </h1>
            <p className="px-8 text-center md:text-lg">
              All your classroom tools in one place. Get organized, stay
              focused, and make learning click.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button href="/classroom" type="primary">
              Get started
            </Button>
            <button
              onClick={() => onScrollToSection(featuresSectionRef)}
              className="flex h-10 items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-[#22317c] transition-colors hover:text-[#384689]"
            >
              View features
            </button>
          </div>
        </div>
      </div>
      <div className="h-[90%] w-[90%] rounded-md shadow-lg md:w-[80%]">
        <Image
          src={heroImage}
          width={0}
          height={0}
          placeholder="blur"
          className="rounded-md"
          alt="hero image"
        />
      </div>
    </section>
  );
}
