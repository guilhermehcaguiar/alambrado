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
    if (error || !data?.value) return DEFAULT_EXTRAS;
    return { ...DEFAULT_EXTRAS, ...(data.value as Partial<PriceExtras>) };
  } catch {
    return DEFAULT_EXTRAS;
  }
});