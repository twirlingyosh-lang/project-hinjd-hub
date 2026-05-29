// Re-submits the sitemap to Google Search Console via the Lovable connector gateway.
// Called automatically by the predev/prebuild sitemap generator, and can be invoked manually.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SITE = "https://hinjd-ecosystem-hub.lovable.app/";
const SITEMAP = "https://hinjd-ecosystem-hub.lovable.app/sitemap.xml";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");

  if (!lovableKey) {
    return new Response(
      JSON.stringify({ success: false, error: "LOVABLE_API_KEY missing" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!gscKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "GOOGLE_SEARCH_CONSOLE_API_KEY missing — connect Google Search Console",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const headers = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gscKey,
  };

  const encodedSite = encodeURIComponent(SITE);
  const encodedMap = encodeURIComponent(SITEMAP);
  const url = `${GATEWAY}/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedMap}`;

  try {
    const res = await fetch(url, { method: "PUT", headers });
    const body = await res.text();
    return new Response(
      JSON.stringify({
        success: res.ok,
        status: res.status,
        sitemap: SITEMAP,
        body: body.slice(0, 500),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});