import { createContext, type ReactNode, useContext, useState } from "react";

const Context = createContext<{
  isLinkEditMode: boolean;
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
}>({
  isLinkEditMode: false,
  setIsLinkEditMode: () => {},
});

export function FloatingLinkContext({ children }: { children: ReactNode }) {
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  return (
    <Context.Provider value={{ isLinkEditMode, setIsLinkEditMode }}>
      {children}
    </Context.Provider>
  );
}

export function useFloatingLinkContext() {
  return useContext(Context);
}
