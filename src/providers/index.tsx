import type React from "react";

import { I18nProvider } from "@/providers/I18nProvider";
import { NavProvider } from "@/providers/NavProvider";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

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
