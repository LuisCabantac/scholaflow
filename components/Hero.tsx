import Button from "@/components/Button";
import heroImage from "@/public/landing_page/hero.png";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="z-10 flex flex-col items-center">
      <section className="flex items-center justify-center gap-4 px-4 pb-10 pt-20 text-center md:px-48 md:pb-10 md:pt-14">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
          <div className="grid gap-6">
            <h1 className="text-3xl font-semibold md:text-6xl">
              Your School&apos;s All-in-One Learning Platform
            </h1>
            <p className="px-8 text-center text-sm md:text-lg">
              Virtual classrooms, essential tools, and everything you need for
              learning, all in one place. Simplify your school day and make
              learning easier.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button href="/user/dashboard" type="primary">
              Get started
            </Button>
            <Button href="#" type="secondary">
              View features
            </Button>
          </div>
        </div>
      </section>
      <Image
        src={heroImage}
        width={0}
        height={0}
        placeholder="blur"
        className="h-[90%] w-[90%] rounded-md shadow-lg md:w-[70%]"
        alt="hero image"
      />
    </div>
  );
}
