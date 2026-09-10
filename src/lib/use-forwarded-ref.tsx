import type React from "react";
import { useEffect, useRef } from "react";

export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  // Merging a forwarded ref with a local ref requires mutating `ref.current`,
  // which is the intended, standard use of a ref object.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });
  /* eslint-enable react-hooks/immutability */

  return innerRef;
}
