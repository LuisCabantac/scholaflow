import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

import type { EditorProps } from "@/types/editor";

const LexicalEditor = lazy(() =>
  import("@/components/editor/editor-00/editor").then((module) => ({
    default: module.Editor,
  })),
);

const fallback = <div className="min-h-72" />;

export default function Editor(props: EditorProps) {
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <LexicalEditor {...props} />
      </Suspense>
    </ClientOnly>
  );
}
