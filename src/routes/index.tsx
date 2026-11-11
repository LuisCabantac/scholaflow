import { createFileRoute } from "@tanstack/react-router";

import Nav from "@/components/layout/Nav";
import LandingPage from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "ScholaFlow - Your All-in-One Learning Platform" }],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Nav showButton={true} />
      <LandingPage />
    </>
  );
}
