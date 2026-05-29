// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from the route list below.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://hinjd-ecosystem-hub.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

// Public, indexable routes only. Omit /auth-gated app internals, /crm, /debug, /not-found.
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/beltsaver", changefreq: "weekly", priority: "0.9" },
  { path: "/conveyor-maintenance", changefreq: "weekly", priority: "0.9" },
  { path: "/aggregate-opps", changefreq: "monthly", priority: "0.7" },
  { path: "/content-generator", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/app", changefreq: "weekly", priority: "0.6" },
  { path: "/app/equipment", changefreq: "weekly", priority: "0.6" },
  { path: "/app/materials", changefreq: "weekly", priority: "0.6" },
  { path: "/app/calculator", changefreq: "weekly", priority: "0.5" },
  { path: "/app/install", changefreq: "monthly", priority: "0.4" },
];

const today = new Date().toISOString().slice(0, 10);

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries, ${today})`);

// Best-effort: ping the resubmit-sitemap edge function so Google re-fetches.
// Skipped silently if the project ref or function are unavailable (e.g. local dev without network).
const projectRef =
  process.env.VITE_SUPABASE_PROJECT_ID || "umfsspcknteaocrbveat";
const fnUrl = `https://${projectRef}.supabase.co/functions/v1/resubmit-sitemap`;

(async () => {
  try {
    const res = await fetch(fnUrl, { method: "POST" });
    const text = await res.text();
    console.log(`resubmit-sitemap: ${res.status} ${text.slice(0, 200)}`);
  } catch (err) {
    console.log(
      `resubmit-sitemap skipped: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
})();