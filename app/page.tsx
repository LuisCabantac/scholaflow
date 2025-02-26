import { Metadata } from "next";

import Nav from "@/components/Nav";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "ScholaFlow - Your All-in-One Learning Platform",
};
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f3f6ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.2),rgba(255,255,255,0))]">
      <Nav showButton={true} />
      <LandingPage />
    </div>
  );
}
