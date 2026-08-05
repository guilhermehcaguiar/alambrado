import { createClient } from "@supabase/supabase-js";
const client = createClient(
  "https://hdtadufhtissqkconukd.supabase.co",
  process.env.SERVICE_KEY
);
const { data, error } = await client
  .from("products")
  .select("name, category, price, promo_price, promo_min_qty, promo_tiers, promo_starts_at")
  .eq("category", "retro")
  .eq("available", true)
  .limit(15);
if (error) console.error("ERR", error.message);
else {
  console.log("count", data.length);
  for (const r of data)
    console.log(
      String(r.price).padEnd(8),
      "| pp:", String(r.promo_price).padEnd(8),
      "| min:", String(r.promo_min_qty).padEnd(5),
      "| tiers:", JSON.stringify(r.promo_tiers),
      "|", r.name
    );
}
process.exit(0);