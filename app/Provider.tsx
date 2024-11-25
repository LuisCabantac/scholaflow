"use client";

import React from "react";
import QueryProvider from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClickOutsideProvider } from "@/contexts/ClickOutsideContext";
import { NavProvider } from "@/contexts/NavContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NavProvider>
        <ClickOutsideProvider>
          <QueryProvider>{children}</QueryProvider>
        </ClickOutsideProvider>
      </NavProvider>
    </SidebarProvider>
  );
}
