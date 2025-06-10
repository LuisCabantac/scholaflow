import { Metadata } from "next";

import Nav from "@/components/Nav";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "ScholaFlow - Your All-in-One Learning Platform",
};

export default function Home() {
  return (
    <>
      <Nav showButton={true} />
      <LandingPage />
    </>
  );
}
