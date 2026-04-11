/**
 * CycleMart Business Logo Scraper
 * Fetches logos from business websites and updates logo_url in DB
 * Run: npx tsx src/db/scrapers/scrape-business-logos.ts
 */

import { neon } from "@neondatabase/serverless";
import * as cheerio from "cheerio";

const sql = neon(process.env.DATABASE_URL!);

const DELAY_MS   = 1500; // 1.5s between requests
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "CycleMartBot/1.0 (+https://cyclemart.co.za)" },
      });
      clearTimeout(timer);
      return res;
    } catch {
      if (i < retries - 1) await sleep(2000);
    }
  }
  return null;
}

function resolveUrl(base: string, path: string): string | null {
  if (!path) return null;
  if (path.startsWith("data:")) return null;
  try {
    return new URL(path, base).href;
  } catch {
    return null;
  }
}

async function isValidImage(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "CycleMartBot/1.0" },
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return false;
    const cl = parseInt(res.headers.get("content-length") || "0", 10);
    // Reject tiny images (likely tracking pixels)
    if (cl > 0 && cl < 5000) return false;
    return true;
  } catch {
    return false;
  }
}

async function findLogo(website: string): Promise<string | null> {
  const res = await fetchWithRetry(website);
  if (!res || !res.ok) return null;

  let html: string;
  try { html = await res.text(); } catch { return null; }

  const $ = cheerio.load(html);
  const candidates: string[] = [];

  // Priority 1: OG image
  const og = $('meta[property="og:image"]').attr("content");
  if (og) candidates.push(og);

  // Priority 2: Apple touch icon (often the best square logo)
  const apple = $('link[rel="apple-touch-icon"]').attr("href") ||
                $('link[rel="apple-touch-icon-precomposed"]').attr("href");
  if (apple) candidates.push(apple);

  // Priority 3: Favicon (SVG/PNG only, not ico)
  $('link[rel="icon"], link[rel="shortcut icon"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.match(/\.(svg|png)(\?|$)/i)) candidates.push(href);
  });

  // Priority 4: img with logo in alt/class/id
  $('img').each((_, el) => {
    const src   = $(el).attr("src")   || "";
    const alt   = $(el).attr("alt")   || "";
    const cls   = $(el).attr("class") || "";
    const id    = $(el).attr("id")    || "";
    const name  = $(el).attr("name")  || "";
    if (/logo/i.test(alt + cls + id + name + src)) {
      candidates.push(src);
    }
  });

  // Priority 5: header first img
  const headerImg = $("header img").first().attr("src");
  if (headerImg) candidates.push(headerImg);

  // Priority 6: .logo or #logo container
  $(".logo img, #logo img, [class*='brand'] img, [class*='Logo'] img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) candidates.push(src);
  });

  // Resolve + validate candidates
  for (const raw of candidates) {
    const absolute = resolveUrl(website, raw);
    if (!absolute) continue;
    if (absolute.startsWith("data:")) continue;
    const valid = await isValidImage(absolute);
    if (valid) return absolute;
  }

  return null;
}

async function run() {
  console.log("\n🔍 CycleMart Business Logo Scraper\n");

  // Fetch businesses without logos that have websites
  const businesses = await sql`
    SELECT id, name, website FROM businesses
    WHERE (logo_url IS NULL OR logo_url = '')
      AND website IS NOT NULL
      AND website != ''
    ORDER BY name ASC
  ` as { id: string; name: string; website: string }[];
  console.log(`Found ${businesses.length} businesses without logos\n`);

  let found  = 0;
  let missed = 0;
  let errors = 0;

  for (const b of businesses) {
    try {
      const logoUrl = await findLogo(b.website);

      if (logoUrl) {
        await sql`UPDATE businesses SET logo_url = ${logoUrl}, updated_at = NOW() WHERE id = ${b.id}`;
        console.log(`  ✓ ${b.name}`);
        console.log(`    → ${logoUrl}`);
        found++;
      } else {
        console.log(`  ⚠ ${b.name} → no logo found`);
        missed++;
      }
    } catch (e: any) {
      console.log(`  ✗ ${b.name} → error: ${e.message}`);
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${found} logos found | ${missed} not found | ${errors} errors`);

  // Final count
  const updated = await sql`SELECT COUNT(*) AS count FROM businesses WHERE logo_url IS NOT NULL AND logo_url != ''`;
  console.log(`📊 Total businesses with logo: ${(updated[0] as any).count}`);

  process.exit(0);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
