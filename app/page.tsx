import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import Nav from "@/components/Nav";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "ScholaFlow - Your All-in-One Learning Platform",
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) return redirect("/classroom");

  return (
    <>
      <Nav showButton={true} />
      <LandingPage />
    </>
  );
}
