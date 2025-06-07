import { Metadata } from "next";

import Nav from "@/components/Nav";
import CloseAccountSection from "@/components/CloseAccountSection";

export const metadata: Metadata = {
  title: "Close Account",
  description:
    "Close your ScholaFlow account permanently and delete all associated data.",
};

export default async function Page() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f3f6ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.2),rgba(255,255,255,0))]">
      <div className="absolute left-0 top-1.5 md:-top-0.5">
        <Nav showButton={false} />
      </div>
      <CloseAccountSection />
    </div>
  );
}
