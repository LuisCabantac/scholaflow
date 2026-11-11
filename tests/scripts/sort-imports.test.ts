import { describe, expect, it } from "vitest";

import { sortImportBlock } from "../../scripts/sort-imports.mjs";

describe("sortImportBlock", () => {
  it("orders groups and sorts each by length", () => {
    const input = `import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "cn";

export const x = 1;
`;
    expect(sortImportBlock(input)).toBe(`import { cn } from "cn";
import { z } from "zod";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";

export const x = 1;
`);
  });

  it("keeps side-effect imports in their original relative order", () => {
    const input = `import "./zz-long-second.css";
import "./a.css";
import { z } from "zod";

export {};
`;
    expect(sortImportBlock(input)).toBe(`import { z } from "zod";

import "./zz-long-second.css";
import "./a.css";

export {};
`);
  });

  it("is idempotent and does not add blank lines to an imports-only file", () => {
    const input = `import "./a.css";
import "./b.css";
`;
    const once = sortImportBlock(input);
    expect(once).toBe(input);
    expect(sortImportBlock(once)).toBe(once);
  });

  it("skips leading directives and comments and still sorts", () => {
    const input = `"use client";
/// <reference types="vite/client" />
import { z } from "zod";
import { cn } from "cn";

export {};
`;
    expect(sortImportBlock(input)).toBe(`"use client";
/// <reference types="vite/client" />
import { cn } from "cn";
import { z } from "zod";

export {};
`);
  });

  it("handles multi-line and type imports by collapsed length", () => {
    const input = `import {
  aVeryLongNameOne,
  aVeryLongNameTwo,
} from "@/lib/long";
import type { X } from "@/lib/x";

export {};
`;
    expect(sortImportBlock(input)).toBe(`import type { X } from "@/lib/x";
import {
  aVeryLongNameOne,
  aVeryLongNameTwo,
} from "@/lib/long";

export {};
`);
  });

  it("leaves a file without a leading import block untouched", () => {
    const input = `export const a = 1;\n`;
    expect(sortImportBlock(input)).toBe(input);
  });
});
