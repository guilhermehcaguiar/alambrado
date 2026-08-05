import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type PriceExtras = {
  oversizedSizes: string[];
  oversizedSurcharge: number;
  personalizationPrice: number;
  patchPrice: number;
};

const DEFAULT_EXTRAS: PriceExtras = {
  oversizedSizes: ["3XG", "4XG"],
  oversizedSurcharge: 19.9,
  personalizationPrice: 0,
  patchPrice: 0,
};

export const getPriceExtras = cache(async (): Promise<PriceExtras> => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("price_config")
      .select("value")
      .eq("key", "extras")
      .maybeSingle();
    if (error || !data || !data.value) return DEFAULT_EXTRAS;
    const raw = data.value as Partial<PriceExtras>;
    return {
      oversizedSizes: Array.isArray(raw.oversizedSizes) ? raw.oversizedSizes.filter((s) => typeof s === "string") : DEFAULT_EXTRAS.oversizedSizes,
      oversizedSurcharge: typeof raw.oversizedSurcharge === "number" ? raw.oversizedSurcharge : DEFAULT_EXTRAS.oversizedSurcharge,
      personalizationPrice: typeof raw.personalizationPrice === "number" ? raw.personalizationPrice : DEFAULT_EXTRAS.personalizationPrice,
      patchPrice: typeof raw.patchPrice === "number" ? raw.patchPrice : DEFAULT_EXTRAS.patchPrice,
    };
  } catch {
    return DEFAULT_EXTRAS;
  }
});