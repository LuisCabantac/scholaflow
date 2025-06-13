"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={3000}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--card))",
          "--normal-text": "hsl(var(--card-foreground))",
          "--normal-border": "hsl(var(--border))",
          borderRadius: 12,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
