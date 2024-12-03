import Button from "./Button";

export default function CTA() {
  return (
    <section className="mx-6 mb-24 flex items-center justify-center text-center md:mx-24">
      <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
        <h4 className="text-3xl font-semibold tracking-tighter md:text-5xl">
          Learning without the hassle
        </h4>
        <p className="px-2 text-center text-base">
          Ditch the bloated, overcomplicated platforms. We&apos;re building
          something that just works.
        </p>
        <Button type="primary" href="/user/classroom">
          Get started for free
        </Button>
      </div>
    </section>
  );
}
