import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import Provider from "./Provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scholaflow.vercel.app/"),
  title: {
    template: "%s | ScholaFlow",
    default: "ScholaFlow",
  },
  description:
    "All your classroom tools in one place. Get organized, stay focused, and make learning click.",
  openGraph: {
    type: "website",
    url: "https://scholaflow.vercel.app",
    title: "ScholaFlow - Your All-in-One Learning Platform",
    description:
      "All your classroom tools in one place. Get organized, stay focused, and make learning click.",
    siteName: "ScholaFlow",
    images: [
      {
        url: "https://github.com/user-attachments/assets/45ab4040-3e8b-4aea-9925-a944167168b8",
        width: 1200,
        height: 630,
      },
    ],
  },
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
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${beVietnamPro.className} box-border text-sm antialiased`}
        >
          <Provider>{children}</Provider>
          <Toaster position="top-center" />
        </body>
      </html>
    </>
  );
}
