import type { ReactNode } from "react";
import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  QuoteIcon,
  TextIcon,
} from "lucide-react";

import type { BlockFormatKey } from "@/types/editor";

export const blockTypeToBlockName: Record<
  string,
  { key: BlockFormatKey; icon: ReactNode }
> = {
  paragraph: { key: "paragraph", icon: <TextIcon className="size-4" /> },
  h1: { key: "h1", icon: <Heading1Icon className="size-4" /> },
  h2: { key: "h2", icon: <Heading2Icon className="size-4" /> },
  h3: { key: "h3", icon: <Heading3Icon className="size-4" /> },
  number: { key: "number", icon: <ListOrderedIcon className="size-4" /> },
  bullet: { key: "bullet", icon: <ListIcon className="size-4" /> },
  check: { key: "check", icon: <ListTodoIcon className="size-4" /> },
  code: { key: "code", icon: <CodeIcon className="size-4" /> },
  quote: { key: "quote", icon: <QuoteIcon className="size-4" /> },
};
