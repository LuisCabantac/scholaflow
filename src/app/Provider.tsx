"use client";

import React from "react";
import QueryProvider from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClickOutsideProvider } from "@/contexts/ClickOutsideContext";
import { NavProvider } from "@/contexts/NavContext";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NavProvider>
        <ClickOutsideProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ClickOutsideProvider>
      </NavProvider>
    </SidebarProvider>
  );
}
