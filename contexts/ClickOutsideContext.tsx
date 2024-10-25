"use client";

import React, { createContext, RefObject, useContext, useEffect } from "react";

interface SidebarType {
  useClickOutsideHandler: (
    ref: RefObject<HTMLElement>,
    onClickOutside: () => void,
  ) => void;
}

const clickOutsideDefaultValue: SidebarType = {
  useClickOutsideHandler: () => {},
};

const ClickOutsideContext = createContext(clickOutsideDefaultValue);

function ClickOutsideProvider({ children }: { children: React.ReactNode }) {
  function useClickOutsideHandler(
    ref: RefObject<HTMLElement>,
    onClickOutside: () => void,
  ) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          onClickOutside();
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, onClickOutside]);
  }

  return (
    <ClickOutsideContext.Provider value={{ useClickOutsideHandler }}>
      {children}
    </ClickOutsideContext.Provider>
  );
}

function useClickOutside() {
  const context = useContext(ClickOutsideContext);
  if (!context)
    throw new Error(
      "useClickOutside context can't be used outside the ClickOutsideProvider",
    );
  return context;
}

export { ClickOutsideProvider, useClickOutside };
