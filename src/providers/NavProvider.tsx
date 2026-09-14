import React, { createContext, useContext, useState, useEffect } from "react";

const NavProviderContext = createContext({
  isSticky: false,
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isSticky, setIsSticky] = useState<boolean>(false);

  useEffect(function () {
    const handleSetIsSticky = () => {
      setIsSticky(window.scrollY >= 20);
    };

    window.addEventListener("scroll", handleSetIsSticky);
    return () => window.removeEventListener("scroll", handleSetIsSticky);
  }, []);

  return (
    <NavProviderContext
      value={{
        isSticky,
      }}
    >
      {children}
    </NavProviderContext>
  );
}

export function useNav() {
  const context = useContext(NavProviderContext);
  if (context === undefined)
    throw new Error("useNav must be used within the NavProvider");
  return context;
}
