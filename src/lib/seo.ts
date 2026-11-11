export const SITE_URL = "https://scholaflow.vercel.app";
export const SITE_NAME = "ScholaFlow";
export const SITE_TAGLINE = "ScholaFlow - Your All-in-One Learning Platform";
export const SITE_DESCRIPTION =
  "All your classroom tools in one place. Get organized, stay focused, and make learning click.";
export const SITE_IMAGE =
  "https://github.com/user-attachments/assets/45ab4040-3e8b-4aea-9925-a944167168b8";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/terms", "/privacy"];
const PRIVATE_PREFIXES = [
  "/classroom",
  "/notes",
  "/to-do",
  "/notifications",
  "/profile",
  "/user-management",
  "/api/",
];

type PageHeadOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function pageHead({
  title,
  description,
  path,
  index = true,
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (!index) meta.push({ name: "robots", content: "noindex, nofollow" });

  return {
    meta,
    links: index ? [{ rel: "canonical", href: url }] : [],
  };
}

export function robotsTxt() {
  const disallow = PRIVATE_PREFIXES.map((prefix) => `Disallow: ${prefix}`);

  return [
    "User-agent: *",
    "Allow: /",
    ...disallow,
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

export function sitemapXml() {
  const urls = PUBLIC_PATHS.map(
    (path) => `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n  </url>`,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
