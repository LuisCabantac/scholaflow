"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarType {
  isMobile: boolean;
  sidebarExpand: boolean;
  sidebarClassroomExpand: boolean;
  handleSidebarExpand: () => void;
  handleSidebarClassroomExpand: () => void;
}

const sidebarDefaultValue: SidebarType = {
  isMobile: false,
  sidebarExpand: false,
  sidebarClassroomExpand: false,
  handleSidebarExpand: () => {},
  handleSidebarClassroomExpand: () => {},
};

const SidebarContext = createContext(sidebarDefaultValue);

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(min-width: 900px)").matches,
  );
  const [sidebarExpand, setSidebarExpand] = useState(isMobile);
  const [sidebarClassroomExpand, setSidebarClassroomExpand] = useState(true);

  function handleSidebarExpand() {
    setSidebarExpand(!sidebarExpand);
  }

  function handleSidebarClassroomExpand() {
    setSidebarClassroomExpand(!sidebarClassroomExpand);
  }

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.matchMedia("(min-width: 900px)").matches);
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
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
        sidebarClassroomExpand,
        handleSidebarExpand,
        handleSidebarClassroomExpand,
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
