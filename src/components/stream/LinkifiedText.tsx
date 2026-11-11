import Linkify from "react-linkify";
import type { ReactNode } from "react";

function decorator(href: string, text: string, key: number) {
  return (
    <a
      href={href}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
      className="overflow-wrap text-ring break-words break-all underline"
    >
      {text}
    </a>
  );
}

export default function LinkifiedText({ children }: { children: ReactNode }) {
  return <Linkify componentDecorator={decorator}>{children}</Linkify>;
}
