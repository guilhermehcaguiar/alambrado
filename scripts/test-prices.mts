import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRICES,
  PRICE_RULES,
  computePriceForSize,
  getSizeSurcharge,
  isOversizedSize,
} from "@/config/prices";
import type { ProductSize } from "@/types/product";

const BASE = PRICES.torcedor;
const REGULAR_SIZES: ProductSize[] = ["P", "M", "G", "GG", "XGG"];

function approx(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `esperado ${expected}, obtido ${actual}`,
  );
}

test("tamanhos regulares P, M, G, GG, XGG mantêm o preço base", () => {
  for (const size of REGULAR_SIZES) {
    approx(getSizeSurcharge(size), 0);
    approx(computePriceForSize(BASE, size), BASE);
  }
});

test("tamanhos especiais 3XG e 4XG recebem acréscimo de R$ 19,90", () => {
  for (const size of PRICE_RULES.oversizedSizes) {
    approx(getSizeSurcharge(size), PRICE_RULES.oversizedSurcharge);
    approx(computePriceForSize(BASE, size), BASE + PRICE_RULES.oversizedSurcharge);
  }
});

test("exemplos da política: M/XGG = R$ 119,90; 3XG/4XG = R$ 139,80", () => {
  approx(computePriceForSize(BASE, "M"), 119.9);
  approx(computePriceForSize(BASE, "XGG"), 119.9);
  approx(computePriceForSize(BASE, "3XG"), 139.8);
  approx(computePriceForSize(BASE, "4XG"), 139.8);
});

test("isOversizedSize é consistente com PRICE_RULES", () => {
  for (const size of PRICE_RULES.oversizedSizes) {
    assert.equal(isOversizedSize(size), true);
  }
  for (const size of REGULAR_SIZES) {
    assert.equal(isOversizedSize(size), false);
  }
});
