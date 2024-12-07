"use client";

import React, { useRef } from "react";

import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const featuresSectionRef = useRef<HTMLDivElement | null>(null);

  function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  return (
    <main>
      <Hero
        onScrollToSection={scrollToSection}
        featuresSectionRef={featuresSectionRef}
      />
      <HowItWorks />
      <Features featuresSectionRef={featuresSectionRef} />
      <CTA />
      <Footer />
    </main>
  );
}
