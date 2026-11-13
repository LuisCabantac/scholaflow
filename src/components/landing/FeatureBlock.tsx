import { cn } from "cn";
import type { ReactNode } from "react";

export default function FeatureBlock({
  eyebrow,
  title,
  description,
  preview,
  previewFirst = false,
  className = "py-16",
}: {
  eyebrow: string;
  title: string;
  description: string;
  preview: (className: string) => ReactNode;
  previewFirst?: boolean;
  className?: string;
}) {
  const copy = (
    <div className="lg:col-span-2">
      <div className="md:pr-6 lg:pr-0">
        <p className="bg-foreground/10 text-primary w-fit rounded-xl border px-2 py-1 text-xs shadow-sm">
          {eyebrow}
        </p>
        <h2 className="text-foreground mt-2 text-3xl font-medium md:text-4xl">
          {title}
        </h2>
        <p className="text-foreground/70 mt-6">{description}</p>
      </div>
    </div>
  );

  return (
    <div className={cn(className)}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          {previewFirst ? (
            <>
              {preview("hidden md:block")}
              {copy}
              {preview("md:hidden")}
            </>
          ) : (
            <>
              {copy}
              {preview("")}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
