import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

import { linkifySegments } from "@/lib/linkify";

function linkifyString(text: string): ReactNode {
  const segments = linkifySegments(text);

  if (segments.length <= 1 && segments[0]?.type !== "link") return text;

  const seen = new Map<string, number>();

  return segments.map((segment) => {
    if (segment.type === "text") return segment.value;

    const occurrence = (seen.get(segment.href) ?? 0) + 1;
    seen.set(segment.href, occurrence);

    return (
      <a
        href={segment.href}
        key={`${segment.href}#${occurrence}`}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-wrap text-ring break-words break-all underline"
      >
        {segment.text}
      </a>
    );
  });
}

function linkifyNode(node: ReactNode): ReactNode {
  if (typeof node === "string") return linkifyString(node);

  if (Array.isArray(node)) return Children.map(node, linkifyNode);

  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === "a" || node.type === "button") return node;

    return cloneElement(
      node as ReactElement<{ children?: ReactNode }>,
      undefined,
      linkifyNode(node.props.children),
    );
  }

  return node;
}

export default function LinkifiedText({ children }: { children: ReactNode }) {
  return <>{linkifyNode(children)}</>;
}
