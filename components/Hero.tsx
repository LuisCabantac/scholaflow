import Image from "next/image";

import landingPageImage1 from "@/public/landing_page/landing-page-1.svg";

import Button from "@/components/Button";

export default function Hero() {
  return (
    <section className="items-center gap-4 px-6 py-24 md:grid md:grid-cols-[4fr_3fr] md:px-12 md:py-24">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold md:text-5xl">
          Your All-in-One Solution for a Seamless Learning Experience
        </h1>
        <p>
          Virtual classrooms and essential tools, all in one. Make learning
          easier.
        </p>
        <Button href="/user/dashboard" type="primary">
          Get started
        </Button>
      </div>
      <div className="relative w-full pt-4 md:pt-0">
        <Image
          src={landingPageImage1}
          alt="road to knowledge"
          className="object-cover"
        />
      </div>
    </section>
  );
}
