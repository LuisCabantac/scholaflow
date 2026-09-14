import React from "react";

import { NavProvider } from "@/providers/NavProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SidebarProvider } from "@/providers/SidebarProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <I18nProvider>
        <NavProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </NavProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
