import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { template: "ScholaFlow - %s", default: "ScholaFlow" },
  description: "Your All-in-One Solution for a Seamless Learning Experience",
};

const poppins = Poppins({
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
        className={`${poppins.className} box-border bg-[#edf2ff] text-[#33383d] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
