import { describe, expect, it } from "vitest";

import {
  keptAttachments,
  pathsInFolder,
  removedAttachments,
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
