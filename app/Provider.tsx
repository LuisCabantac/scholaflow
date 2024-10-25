"use client";

import React from "react";
import QueryProvider from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClickOutsideProvider } from "@/contexts/ClickOutsideContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ClickOutsideProvider>
        <QueryProvider>{children}</QueryProvider>
      </ClickOutsideProvider>
    </SidebarProvider>
  );
}
