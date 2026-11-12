import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const NavProviderContext = createContext({
  isSticky: false,
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isSticky, setIsSticky] = useState<boolean>(false);

  useEffect(() => {
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
