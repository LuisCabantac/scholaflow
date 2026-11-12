import { useEffect, useRef, useState } from "react";

import { resolveAvatarSrc } from "@/lib/default-avatar";

type UserAvatarProps = Omit<React.ComponentProps<"img">, "src"> & {
  src: string | null | undefined;
};

export default function UserAvatar({
  src,
  alt,
  onError,
  ...props
}: UserAvatarProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (src && img?.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  return (
    <img
      ref={ref}
      {...props}
      alt={alt}
      src={resolveAvatarSrc(src, failedSrc)}
      onError={(event) => {
        setFailedSrc(src ?? null);
        onError?.(event);
      }}
    />
  );
}
