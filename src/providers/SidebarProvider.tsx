"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarProviderContext = createContext({
  isMobile: false,
  sidebarExpand: false,
  handleSidebarExpand: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpand, setSidebarExpand] = useState(isMobile);
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile);

  function handleSidebarExpand() {
    setSidebarExpand(!sidebarExpand);
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px)");
    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();

    mediaQuery.addEventListener("change", handleResize);
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  if (isMobile !== prevIsMobile) {
    setPrevIsMobile(isMobile);
    setSidebarExpand(isMobile);
  }

  return (
    <SidebarProviderContext
      value={{
        isMobile,
        sidebarExpand,
        handleSidebarExpand,
      }}
    >
      {children}
    </SidebarProviderContext>
  );
}

export function useSidebar() {
  const context = useContext(SidebarProviderContext);
  if (context === undefined)
    throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}
