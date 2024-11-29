import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "react-hot-toast";

import Provider from "./Provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { template: "%s | ScholaFlow", default: "ScholaFlow" },
  description: "Your All-in-One Learning Platform.",
  openGraph: {
    type: "website",
    url: "https://scholaflow.vercel.app",
    title: "ScholaFlow",
    description: "Your All-in-One Learning Platform.",
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
    <html lang="en">
      <body
        className={`${beVietnamPro.className} box-border bg-[#edf2ff] text-sm text-[#474c50] antialiased`}
      >
        <Provider>{children}</Provider>
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            style: {
              color: "#5c7cfa",
              backgroundColor: "#f3f6ff",
              fontWeight: 500,
              padding: "0.75rem 1.25rem",
            },
          }}
        />
      </body>
    </html>
  );
}
