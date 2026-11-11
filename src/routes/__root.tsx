import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import "@fontsource/be-vietnam-pro/100.css";
import "@fontsource/be-vietnam-pro/200.css";
import "@fontsource/be-vietnam-pro/300.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import "@fontsource-variable/quicksand/wght.css";

import type { RouterContext } from "@/integrations/tanstack-query/root-provider";
import { AppProviders } from "@/providers";
import appCss from "@/styles.css?url";

import NotFound from "@/components/shared/NotFound";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "ScholaFlow",
      },
      {
        name: "description",
        content:
          "All your classroom tools in one place. Get organized, stay focused, and make learning click.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://scholaflow.vercel.app" },
      {
        property: "og:title",
        content: "ScholaFlow - Your All-in-One Learning Platform",
      },
      {
        property: "og:description",
        content:
          "All your classroom tools in one place. Get organized, stay focused, and make learning click.",
      },
      { property: "og:site_name", content: "ScholaFlow" },
      {
        property: "og:image",
        content:
          "https://github.com/user-attachments/assets/45ab4040-3e8b-4aea-9925-a944167168b8",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        <Scripts />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
