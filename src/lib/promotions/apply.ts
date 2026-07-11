import type {
  AppliedPromotionResult,
  PromoCartLine,
  PromotionTargetType,
  PromotionWithTargets,
} from "@/lib/promotions/types";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function isPromotionActiveNow(promo: PromotionWithTargets, now: Date) {
  if (!promo.is_active) return false;
  if (promo.starts_at && new Date(promo.starts_at) > now) return false;
  if (promo.ends_at && new Date(promo.ends_at) < now) return false;
  if (promo.usage_limit != null && promo.usage_count >= promo.usage_limit) return false;
  return true;
}

function lineMatchesTarget(
  line: PromoCartLine,
  targetType: PromotionTargetType,
  targetId: string | null
) {
  if (targetType === "all") return true;
  if (line.isCustom || !line.productId) return false;
  if (targetType === "product") return line.productId === targetId;
  if (targetType === "product_group") return line.productGroupId === targetId;
  if (targetType === "product_typology") return line.productTypologyId === targetId;
  return false;
}

function getEligibleLines(promo: PromotionWithTargets, lines: PromoCartLine[]) {
  const targets = promo.promotion_targets;
  if (!targets.length) {
    return lines.filter((l) => !l.isCustom);
  }

  return lines.filter((line) =>
    targets.some((t) => lineMatchesTarget(line, t.target_type, t.target_id))
  );
}

function eligibleSubtotal(eligible: PromoCartLine[]) {
  return roundMoney(eligible.reduce((sum, l) => sum + l.lineTotal, 0));
}

function eligibleQuantity(eligible: PromoCartLine[]) {
  return eligible.reduce((sum, l) => sum + l.quantity, 0);
}

function cartSubtotal(lines: PromoCartLine[]) {
  return roundMoney(lines.reduce((sum, l) => sum + l.lineTotal, 0));
}

function computeDiscount(promo: PromotionWithTargets, lines: PromoCartLine[]): AppliedPromotionResult {
  const eligible = getEligibleLines(promo, lines);
  const eligibleTotal = eligibleSubtotal(eligible);
  const eligibleQty = eligibleQuantity(eligible);
  const subtotal = cartSubtotal(lines);

  if (promo.min_cart_amount != null && subtotal < promo.min_cart_amount) {
    return emptyResult(subtotal);
  }
  if (eligibleQty < promo.min_quantity) {
    return emptyResult(subtotal);
  }

  let discountAmount = 0;
  let freeShipping = false;

  if (promo.promotion_type === "percent_off") {
    discountAmount = roundMoney(eligibleTotal * (promo.discount_value / 100));
  } else if (promo.promotion_type === "fixed_off") {
    discountAmount = roundMoney(Math.min(promo.discount_value, eligibleTotal));
  } else if (promo.promotion_type === "free_shipping") {
    freeShipping = true;
  } else if (promo.promotion_type === "quantity_deal") {
    discountAmount = roundMoney(eligibleTotal * (promo.discount_value / 100));
  } else if (promo.promotion_type === "bundle_percent_off") {
    const bundleQty = promo.bundle_quantity || promo.min_quantity;
    if (eligibleQty >= bundleQty) {
      discountAmount = roundMoney(eligibleTotal * (promo.discount_value / 100));
    }
  } else if (promo.promotion_type === "bundle_fixed_price") {
    const bundleQty = promo.bundle_quantity || promo.min_quantity;
    if (eligibleQty >= bundleQty && bundleQty > 0) {
      const sets = Math.floor(eligibleQty / bundleQty);
      const avgUnit = eligibleTotal / eligibleQty;
      const fullPriceForSets = roundMoney(avgUnit * bundleQty * sets);
      discountAmount = roundMoney(Math.max(0, fullPriceForSets - promo.discount_value * sets));
    }
  }

  discountAmount = roundMoney(Math.min(discountAmount, subtotal));

  return {
    promotionId: promo.id,
    promotionCode: promo.code,
    promotionName: promo.name,
    discountAmount,
    freeShipping,
    subtotalAfterDiscount: roundMoney(Math.max(0, subtotal - discountAmount)),
  };
}

function emptyResult(subtotal: number): AppliedPromotionResult {
  return {
    promotionId: null,
    promotionCode: null,
    promotionName: null,
    discountAmount: 0,
    freeShipping: false,
    subtotalAfterDiscount: subtotal,
  };
}

export function applyBestPromotion(
  promotions: PromotionWithTargets[],
  lines: PromoCartLine[],
  promoCode?: string | null
): AppliedPromotionResult {
  const subtotal = cartSubtotal(lines);
  const now = new Date();
  const normalizedCode = promoCode?.trim().toUpperCase() || "";

  let candidates = promotions.filter((p) => isPromotionActiveNow(p, now));

  if (normalizedCode) {
    candidates = candidates.filter(
      (p) => p.code && p.code.toUpperCase() === normalizedCode
    );
  } else {
    candidates = candidates.filter((p) => !p.requires_code);
  }

  candidates.sort((a, b) => b.priority - a.priority);

  let best = emptyResult(subtotal);

  for (const promo of candidates) {
    const result = computeDiscount(promo, lines);
    const benefit =
      result.discountAmount + (result.freeShipping ? 9999 : 0);
    const bestBenefit =
      best.discountAmount + (best.freeShipping ? 9999 : 0);
    if (benefit > bestBenefit) {
      best = result;
    }
  }

  return best;
}
