"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface NavContextType {
  isSticky: boolean;
}

const navContextDefaultValue: NavContextType = {
  isSticky: false,
};

const NavContext = createContext<NavContextType>(navContextDefaultValue);

function NavProvider({ children }: { children: React.ReactNode }) {
  const [isSticky, setIsSticky] = useState<boolean>(false);

  const handleSetIsSticky = useCallback(() => {
    if (window.scrollY >= 20) {
      setIsSticky(true);
    } else setIsSticky(false);
  }, [setIsSticky]);

  useEffect(
    function () {
      window.addEventListener("scroll", handleSetIsSticky);

      return () => window.removeEventListener("scroll", handleSetIsSticky);
    },
    [handleSetIsSticky],
  );

  return (
    <NavContext.Provider
      value={{
        isSticky,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

function useNav() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNav can't be used outside the NavProvider");
  return context;
}

export { NavProvider, useNav };
