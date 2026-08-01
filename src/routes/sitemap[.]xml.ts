import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/articles", changefreq: "weekly", priority: "0.8" },
          { path: "/events", changefreq: "weekly", priority: "0.8" },
          { path: "/gallery", changefreq: "weekly", priority: "0.8" },
          { path: "/archive", changefreq: "weekly", priority: "0.8" },
          { path: "/map", changefreq: "monthly", priority: "0.6" },
          { path: "/contribute", changefreq: "monthly", priority: "0.5" },
        ];

        const [articles, events, albums, archive] = await Promise.all([
          supabase.from("articles").select("slug").eq("published", true),
          supabase.from("events").select("slug").eq("archived", false),
          supabase.from("albums").select("slug"),
          supabase.from("archive_items").select("slug").eq("published", true),
        ]);

        const push = (rows: { slug: string | null }[] | null, prefix: string) => {
          for (const row of rows ?? []) {
            if (row.slug) entries.push({ path: `${prefix}/${row.slug}`, priority: "0.7" });
          }
        };
        push(articles.data, "/articles");
        push(events.data, "/events");
        push(albums.data, "/gallery");
        push(archive.data, "/archive");



        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
