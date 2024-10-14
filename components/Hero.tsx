import Image from "next/image";

import landingPageImage1 from "@/public/landing_page/landing-page-1.svg";

import Button from "@/components/Button";

export default function Hero() {
  return (
    <section className="items-center gap-4 px-6 py-16 md:grid md:grid-cols-[4fr_3fr] md:px-12 md:py-32">
      <div className="flex flex-col items-start gap-y-4">
        <h1 className="text-3xl font-bold md:text-5xl">
          Your All-in-One Solution for a Seamless Learning Experience
        </h1>
        <p>
          Experience the future of education with ScholaFlow. Our platform
          integrates virtual classrooms, secure data storage, and detailed
          performance analytics into one easy-to-use tool. Say goodbye to
          complicated management and hello to a brighter educational journey for
          both students and educators. Let&apos;s make learning effortless and
          effective together.
        </p>
        <Button href="/user/dashboard" type="primary">
          Get started
        </Button>
      </div>
      <div className="relative w-full">
        <Image
          src={landingPageImage1}
          alt="road to knowledge"
          className="object-cover"
        />
      </div>
    </section>
  );
}
