import { createFileRoute } from "@tanstack/react-router";

import {
  pageHead,
  SITE_URL,
  SITE_NAME,
  SITE_IMAGE,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/seo";

import Nav from "@/components/layout/Nav";
import LandingPage from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageHead({
      title: SITE_TAGLINE,
      description: SITE_DESCRIPTION,
      path: "/",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
            },
            {
              "@type": "SoftwareApplication",
              name: SITE_NAME,
              url: SITE_URL,
              image: SITE_IMAGE,
              description: SITE_DESCRIPTION,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
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
