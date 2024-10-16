import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { template: "ScholaFlow - %s", default: "ScholaFlow" },
  description: "Your All-in-One Solution for a Seamless Learning Experience",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export interface FontType {
  className: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.className} box-border bg-[#edf2ff] text-[#33383d] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
