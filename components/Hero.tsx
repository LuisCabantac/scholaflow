import Button from "@/components/Button";

export default function Hero() {
  return (
    <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.3),rgba(255,255,255,0))]">
      <section className="flex items-center justify-center gap-4 px-4 py-44 text-center md:px-48 md:py-48">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
          <h1 className="bg-gradient-to-br from-[#1a1c1f] to-[#474c50] bg-clip-text text-3xl font-semibold md:text-6xl">
            Your School&apos;s All-in-One Learning Platform
          </h1>
          <p className="px-8 text-center text-sm md:text-lg">
            Virtual classrooms, essential tools, and everything you need for
            learning, all in one place. Simplify your school day and make
            learning easier.
          </p>
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
    </div>
  );
}
