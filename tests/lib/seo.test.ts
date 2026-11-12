import { describe, expect, it } from "vitest";

import {
  SITE_URL,
  absoluteUrl,
  pageHead,
  robotsTxt,
  sitemapXml,
} from "@/lib/seo";

describe("absoluteUrl", () => {
  it("joins a path to the site url", () => {
    expect(absoluteUrl("/sign-in")).toBe(`${SITE_URL}/sign-in`);
  });

  it("maps the root path to the bare site url", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
  });
});

describe("pageHead", () => {
  const head = pageHead({
    title: "Sign in | ScholaFlow",
    description: "Sign in to ScholaFlow.",
    path: "/sign-in",
  });

  it("sets the title and description", () => {
    expect(head.meta).toContainEqual({ title: "Sign in | ScholaFlow" });
    expect(head.meta).toContainEqual({
      name: "description",
      content: "Sign in to ScholaFlow.",
    });
  });

  it("sets open graph and twitter copies of the title, description and url", () => {
    expect(head.meta).toContainEqual({
      property: "og:title",
      content: "Sign in | ScholaFlow",
    });
    expect(head.meta).toContainEqual({
      property: "og:url",
      content: `${SITE_URL}/sign-in`,
    });
    expect(head.meta).toContainEqual({
      name: "twitter:description",
      content: "Sign in to ScholaFlow.",
    });
  });

  it("adds a canonical link for indexable pages and no robots meta", () => {
    expect(head.links).toEqual([
      { rel: "canonical", href: `${SITE_URL}/sign-in` },
    ]);
    expect(head.meta.some((m) => "name" in m && m.name === "robots")).toBe(
      false,
    );
  });

  it("marks private pages noindex without a canonical link", () => {
    const privateHead = pageHead({
      title: "Notes | ScholaFlow",
      description: "Your notes.",
      path: "/notes",
      index: false,
    });

    expect(privateHead.meta).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    });
    expect(privateHead.links).toEqual([]);
  });
});

describe("robotsTxt", () => {
  it("allows the public pages, disallows the app routes and points to the sitemap", () => {
    const text = robotsTxt();

    expect(text).toContain("User-agent: *");
    expect(text).toContain("Allow: /");
    expect(text).toContain("Disallow: /classroom");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});

describe("sitemapXml", () => {
  it("lists only the public pages as absolute urls", () => {
    const xml = sitemapXml();

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<loc>${SITE_URL}</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/sign-up</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/privacy</loc>`);
    expect(xml).not.toContain("/classroom");
    expect(xml).not.toContain("/notes");
  });
});
