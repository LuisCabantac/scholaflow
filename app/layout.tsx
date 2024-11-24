import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import Provider from "./Provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { template: "%s | ScholaFlow", default: "ScholaFlow" },
  description: "Your All-in-One Learning Platform.",
};

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        className={`${beVietnamPro.className} box-border bg-[#edf2ff] text-sm text-[#474c50] antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
