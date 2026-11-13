import { describe, expect, it } from "vitest";

import {
  keptAttachments,
  pathsInFolder,
  removedAttachments,
  uploadableFiles,
} from "@/lib/attachments";

const stored = [
  "https://x/storage/v1/object/public/streams/c1/a.png",
  "https://x/storage/v1/object/public/streams/c1/b.png",
];

describe("keptAttachments", () => {
  it("keeps only stored urls the client still lists", () => {
    expect(keptAttachments(stored, [stored[1]])).toEqual([stored[1]]);
  });

  it("ignores urls the client adds that were never stored", () => {
    expect(
      keptAttachments(stored, [
        ...stored,
        "https://x/storage/v1/object/public/streams/other/v.png",
      ]),
    ).toEqual(stored);
  });

  it("treats a missing stored list as empty", () => {
    expect(keptAttachments(null, ["anything"])).toEqual([]);
  });
});

describe("removedAttachments", () => {
  it("returns stored urls the client dropped", () => {
    expect(removedAttachments(stored, [stored[0]])).toEqual([stored[1]]);
  });

  it("never returns urls that were not stored", () => {
    expect(
      removedAttachments(stored, [...stored, "https://x/foreign"]),
    ).toEqual([]);
  });
});

describe("pathsInFolder", () => {
  it("keeps only object paths inside the record's folder", () => {
    expect(
      pathsInFolder(["c1/a.png", "other/v.png", "c10/z.png"], "c1"),
    ).toEqual(["c1/a.png"]);
  });
});

describe("uploadableFiles", () => {
  it("drops strings, empty files and files named undefined", () => {
    const good = new File(["abc"], "a.txt");
    const empty = new File([], "empty.txt");
    const unnamed = new File(["x"], "undefined");
    expect(uploadableFiles(["text", good, empty, unnamed])).toEqual([good]);
  });

  it("keeps the order of several real files", () => {
    const a = new File(["a"], "a.txt");
    const b = new File(["b"], "b.txt");
    expect(uploadableFiles([a, b])).toEqual([a, b]);
  });
});
