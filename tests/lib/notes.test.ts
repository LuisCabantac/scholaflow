import { describe, expect, it } from "vitest";

import type { Note } from "@/lib/schema";
import { notePreview, splitPinned } from "@/lib/notes";

function lexical(children: { type: string; texts: string[] }[]) {
  return JSON.stringify({
    root: {
      children: children.map((child) => ({
        type: child.type,
        children: child.texts.map((text) => ({ type: "text", text })),
      })),
      type: "root",
    },
  });
}

function note(overrides: Partial<Note>): Note {
  return {
    id: "n1",
    userId: "u1",
    title: "Title",
    content: null,
    attachments: [],
    isPinned: false,
    createdAt: new Date("2026-06-10T12:00:00Z"),
    updatedAt: null,
    ...overrides,
  };
}

describe("notePreview", () => {
  it("joins the text of headings and paragraphs with line breaks", () => {
    const content = lexical([
      { type: "heading", texts: ["Plan"] },
      { type: "paragraph", texts: ["Read ", "chapter 2"] },
    ]);
    expect(notePreview(content)).toBe("Plan\nRead chapter 2");
  });

  it("truncates long text with an ellipsis", () => {
    const content = lexical([{ type: "paragraph", texts: ["a".repeat(300)] }]);
    expect(notePreview(content)).toBe(`${"a".repeat(250)}...`);
    expect(notePreview(content, 10)).toBe(`${"a".repeat(10)}...`);
  });

  it("falls back to the raw string when the content is not lexical json", () => {
    expect(notePreview("plain text")).toBe("plain text");
    expect(notePreview("b".repeat(260))).toBe(`${"b".repeat(250)}...`);
  });

  it("returns an empty string for missing content", () => {
    expect(notePreview(null)).toBe("");
    expect(notePreview(undefined)).toBe("");
    expect(notePreview("")).toBe("");
  });

  it("ignores nodes without text children", () => {
    const content = JSON.stringify({
      root: {
        children: [
          { type: "paragraph" },
          { type: "paragraph", children: [{ type: "text", text: "x" }] },
        ],
      },
    });
    expect(notePreview(content)).toBe("\nx");
  });
});

describe("splitPinned", () => {
  it("separates pinned notes from the others keeping order", () => {
    const notes = [
      note({ id: "a", isPinned: true }),
      note({ id: "b" }),
      note({ id: "c", isPinned: true }),
    ];
    const result = splitPinned(notes);
    expect(result.pinned.map((n) => n.id)).toEqual(["a", "c"]);
    expect(result.others.map((n) => n.id)).toEqual(["b"]);
  });

  it("returns empty lists for null", () => {
    expect(splitPinned(null)).toEqual({ pinned: [], others: [] });
    expect(splitPinned(undefined)).toEqual({ pinned: [], others: [] });
  });
});
