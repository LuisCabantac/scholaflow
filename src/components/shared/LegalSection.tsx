import type { ReactNode } from "react";

type LegalSectionProps = {
  title: string;
  content?: string;
  intro?: string;
  items?: string[];
  children?: ReactNode;
};

export function LegalSection({
  title,
  content,
  intro,
  items,
  children,
}: LegalSectionProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-foreground text-base font-medium md:text-xl">
        {title}
      </h4>
      {content && (
        <p className="text-foreground/70 text-sm md:text-base">{content}</p>
      )}
      {intro && (
        <p className="text-foreground/70 text-sm md:text-base">{intro}</p>
      )}
      {items && items.length > 0 && (
        <ul className="text-foreground/70 space-y-2 text-sm md:text-base">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
