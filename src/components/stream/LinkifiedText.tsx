import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

import { linkifySegments } from "@/lib/linkify";

function linkifyString(text: string): ReactNode {
  const segments = linkifySegments(text);

  if (segments.length <= 1 && segments[0]?.type !== "link") return text;

  return segments.map((segment) =>
    segment.type === "text" ? (
      segment.value
    ) : (
      <a
        href={segment.href}
        key={segment.href + segment.text}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-wrap text-ring break-words break-all underline"
      >
        {segment.text}
      </a>
    ),
  );
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
