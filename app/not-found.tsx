import Image from "next/image";

import pageNotFound from "@/public/app/page-not-found.svg";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-4 grid min-h-screen place-items-center md:mx-8">
      <div className="flex h-[30rem] flex-col items-center justify-center gap-2 md:gap-3">
        <div className="relative w-[15rem] md:w-[20rem]">
          <Image
            src={pageNotFound}
            alt="page not found"
            className="object-cover"
          />
        </div>
        <p className="mb-2 text-center text-base font-medium">
          Sorry, we could not find the page you are looking for.
        </p>
        <Button type="primary" href="/">
          Go back home
        </Button>
      </div>
    </div>
  );
}
