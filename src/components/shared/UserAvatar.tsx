import { useEffect, useRef, useState } from "react";

import { resolveAvatarSrc } from "@/lib/default-avatar";

type UserAvatarProps = Omit<React.ComponentProps<"img">, "src"> & {
  src: string | null | undefined;
};

export default function UserAvatar({
  src,
  alt,
  className,
  width,
  height,
  onError,
  ...props
}: UserAvatarProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = resolveAvatarSrc(src, failedSrc);

  useEffect(() => {
    const img = ref.current;
    if (src && img?.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  if (!resolved) {
    return (
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label={alt}
        width={width}
        height={height}
        className={className}
      >
        <circle cx="32" cy="32" r="32" className="fill-sidebar-accent" />
        <circle cx="32" cy="25" r="11" className="fill-sidebar-ring" />
        <path d="M12 56a20 20 0 0 1 40 0v8H12z" className="fill-sidebar-ring" />
      </svg>
    );
  }

  return (
    <img
      ref={ref}
      {...props}
      alt={alt}
      className={className ? `object-cover ${className}` : "object-cover"}
      width={width}
      height={height}
      src={resolved}
      onError={(event) => {
        setFailedSrc(src ?? null);
        onError?.(event);
      }}
    />
  );
}
