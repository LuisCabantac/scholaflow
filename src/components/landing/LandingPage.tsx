import { ChevronUp } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useNav } from "@/providers/NavProvider";

import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import StepsSection from "@/components/landing/StepsSection";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const { isSticky } = useNav();
  const { t } = useTranslation("landing");

  const featuresSectionRef = useRef<HTMLElement | null>(null);

  function scrollToFeatures() {
    featuresSectionRef.current?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }

  return (
    <main>
      <HeroSection onViewFeatures={scrollToFeatures} />
      <StepsSection />
      <FeaturesSection sectionRef={featuresSectionRef} />
      <CtaSection />
      <Footer />
      <div className="fixed right-8 bottom-8 z-50 hidden md:block">
        <div
          className="transition-all duration-300"
          style={{
            opacity: isSticky ? 1 : 0,
            transform: isSticky ? "translateY(0)" : "translateY(20px)",
            pointerEvents: isSticky ? "auto" : "none",
          }}
        >
          <button
            type="button"
            aria-label={t("backToTop")}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-card hover:bg-muted flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-colors"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
