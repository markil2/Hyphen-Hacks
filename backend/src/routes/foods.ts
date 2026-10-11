import { Router } from "express";
import { z } from "zod";
import { AppError, ok, validate } from "../http";

/**
 * Food lookups and the kitchen shop.
 * - /foods/search proxies Open Food Facts (open data, no key) so the app can log real foods.
 * - /shop/products is a short, curated list of baby-food brands with links to their own stores.
 *   Nothing here is sponsored or reviewed by Nurture, and no prices are invented.
 */
export const foodsRouter = Router();

type OffProduct = { code?: string; product_name?: string; brands?: string[] | string; image_small_url?: string; categories_tags?: string[]; nutriscore_grade?: string; allergens_tags?: string[] };
const cache = new Map<string, { at: number; items: unknown[] }>();

foodsRouter.get("/foods/search", validate(z.object({ query: z.object({ q: z.string().trim().min(2).max(80), baby: z.enum(["true", "false"]).default("false") }) })), async (req, res, next) => {
  try {
    const { q, baby } = req.query as { q: string; baby: string };
    const key = `${baby}:${q.toLowerCase()}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < 6 * 3600_000) return ok(res, { items: hit.items, source: "Open Food Facts" });

    // Open Food Facts' search service; Lucene-style filter keeps results to baby foods when asked.
    const url = new URL("https://search.openfoodfacts.org/search");
    url.search = new URLSearchParams({
      q: baby === "true" ? `${q} AND categories_tags:"en:baby-foods"` : q,
      page_size: "20",
      fields: "code,product_name,brands,image_small_url,categories_tags,allergens_tags",
    }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "Nurture/1.0 (baby-care app; local development)" }, signal: AbortSignal.timeout(7000) }).catch(() => null);
    if (!response?.ok) throw new AppError(502, "FOOD_SEARCH_UNAVAILABLE", "Food search is unavailable right now");
    const data = (await response.json()) as { hits?: OffProduct[] };
    const items = (data.hits ?? [])
      .filter((p) => p.product_name)
      .map((p) => ({
        code: p.code ?? null,
        name: p.product_name!.trim(),
        brand: (Array.isArray(p.brands) ? p.brands[0] : p.brands?.split(",")[0])?.trim() || null,
        imageUrl: p.image_small_url ?? null,
        allergens: (p.allergens_tags ?? []).map((a) => a.replace(/^en:/, "").replace(/-/g, " ")),
        babyFood: (p.categories_tags ?? []).some((c) => c.includes("baby")),
        url: p.code ? `https://world.openfoodfacts.org/product/${p.code}` : null,
      }));
    cache.set(key, { at: Date.now(), items });
    ok(res, { items, source: "Open Food Facts" });
  } catch (e) { next(e); }
});

const SHOP = [
  { id: "once-upon-a-farm", brand: "Once Upon a Farm", name: "Refrigerated fruit & veggie blends", category: "purees", ageFromMonths: 6, description: "Organic blends kept in the fridge, in pouches and cups.", storeUrl: "https://onceuponafarmorganics.com" },
  { id: "serenity-kids", brand: "Serenity Kids", name: "Savory pouches with meat & veggies", category: "pouches", ageFromMonths: 6, description: "Veggie-forward and savory flavors, including meat-based pouches.", storeUrl: "https://www.serenitykids.com" },
  { id: "little-spoon", brand: "Little Spoon", name: "Babyblends", category: "purees", ageFromMonths: 6, description: "Fresh purees delivered by subscription.", storeUrl: "https://www.littlespoon.com" },
  { id: "cerebelly", brand: "Cerebelly", name: "Veggie-first purees & bars", category: "pouches", ageFromMonths: 6, description: "Purees and bars that lead with vegetables.", storeUrl: "https://cerebelly.com" },
  { id: "happy-baby", brand: "Happy Baby Organics", name: "Purees, puffs & melts", category: "snacks", ageFromMonths: 6, description: "Organic pouches plus dissolvable snacks for later stages.", storeUrl: "https://www.happyfamilyorganics.com" },
  { id: "earths-best", brand: "Earth's Best Organic", name: "Infant cereals & jars", category: "cereals", ageFromMonths: 6, description: "Organic single-grain cereals and jarred first foods.", storeUrl: "https://www.earthsbest.com" },
  { id: "gerber", brand: "Gerber", name: "1st Foods purees", category: "purees", ageFromMonths: 6, description: "Single-ingredient first purees, widely available.", storeUrl: "https://www.gerber.com" },
];

foodsRouter.get("/shop/products", async (_req, res) => {
  ok(res, {
    items: SHOP,
    notice: "Not sponsored and not reviewed by Nurture. Links go to each brand's own store. Check labels for allergens and age guidance, and ask your pediatrician before starting solids.",
  });
});
