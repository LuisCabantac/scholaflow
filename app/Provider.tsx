"use client";

import React from "react";
import QueryProvider from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <QueryProvider>{children}</QueryProvider>
    </SidebarProvider>
  );
}
