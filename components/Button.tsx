import React from "react";

export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md bg-[#22317c] px-6 py-3 text-sm font-semibold text-[#edf2ff] transition-colors hover:bg-[#384689]">
      {children}
    </button>
  );
}
