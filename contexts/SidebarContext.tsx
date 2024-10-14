"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarType {
  sidebarExpand: boolean;
  handleSidebarExpand: () => void;
}

const sidebarDefaultValue: SidebarType = {
  sidebarExpand: false,
  handleSidebarExpand: () => {},
};

const SidebarContext = createContext(sidebarDefaultValue);

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarExpand, setSidebarExpand] = useState(false);

  function handleSidebarExpand() {
    setSidebarExpand(!sidebarExpand);
  }

  return (
    <SidebarContext.Provider value={{ sidebarExpand, handleSidebarExpand }}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error(
      "useSidebar context can't be used outside the SidebarProvider",
    );
  return context;
}

export { SidebarProvider, useSidebar };
