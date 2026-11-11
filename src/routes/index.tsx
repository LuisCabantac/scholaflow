import { createFileRoute } from "@tanstack/react-router";

import LandingPage from "@/components/landing/LandingPage";
import Nav from "@/components/layout/Nav";

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
