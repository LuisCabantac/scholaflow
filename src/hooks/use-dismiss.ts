import { useCallback, useEffect, useRef, useState } from "react";

const EXIT_MS = 200;

export function useDismiss(onClose: () => void, disabled: boolean) {
  const [phase, setPhase] = useState<"open" | "closing">("open");
  const timer = useRef<number | undefined>(undefined);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const close = useCallback(() => {
    if (disabled || timer.current !== undefined) return;
    setPhase("closing");
    timer.current = window.setTimeout(() => onCloseRef.current(), EXIT_MS);
  }, [disabled]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { phase, close };
}
