import tlds from "tlds";
import { LinkifyIt } from "linkify-it";

import type { LinkSegment } from "@/types/stream";

const linkify = new LinkifyIt({ fuzzyLink: true, tlds });

export function linkifySegments(text: string): LinkSegment[] {
  if (text === "") return [];

  const matches = linkify.match(text);
  if (!matches) return [{ type: "text", value: text }];

  const segments: LinkSegment[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "link", href: match.url, text: match.text });
    lastIndex = match.lastIndex;
  }

  if (text.length > lastIndex) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
