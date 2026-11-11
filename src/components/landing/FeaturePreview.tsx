import { cn } from "cn";
import type { ReactNode } from "react";

export default function FeaturePreview({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "border-border/50 bg-card relative rounded-3xl border p-3 lg:col-span-3",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <div className="h-[20rem]">
          <div
            className={cn(
              "h-full overflow-hidden rounded-t-2xl border-x border-t text-pretty",
              innerClassName,
            )}
          >
            {children}
          </div>
        </div>
        <div className="from-card/90 pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t to-transparent" />
      </div>
    </div>
  );
}
