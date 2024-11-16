"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarType {
  isMobile: boolean;
  sidebarExpand: boolean;
  handleSidebarExpand: () => void;
}

const sidebarDefaultValue: SidebarType = {
  isMobile: false,
  sidebarExpand: false,
  handleSidebarExpand: () => {},
};

const SidebarContext = createContext(sidebarDefaultValue);

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpand, setSidebarExpand] = useState(isMobile);

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

  useEffect(() => {
    setSidebarExpand(isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        sidebarExpand,
        handleSidebarExpand,
      }}
    >
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
