import type { Enums } from "@/types/database";

export type PromotionType = Enums<"promotion_type">;
export type PromotionTargetType = Enums<"promotion_target_type">;

export const PROMOTION_TYPES: PromotionType[] = [
  "percent_off",
  "fixed_off",
  "free_shipping",
  "bundle_fixed_price",
  "bundle_percent_off",
  "quantity_deal",
];

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  percent_off: "Sconto percentuale",
  fixed_off: "Sconto importo fisso",
  free_shipping: "Spedizione gratuita",
  bundle_fixed_price: "Bundle prezzo fisso",
  bundle_percent_off: "Bundle sconto percentuale",
  quantity_deal: "Offerta quantita",
};

export const PROMOTION_TYPE_INSTRUCTIONS: Record<PromotionType, string> = {
  percent_off:
    "Applica una percentuale di sconto sul subtotale eleggibile. Imposta Sconto/valore come percentuale (es. 15 = 15%). Seleziona prodotti, gruppi o tipologie target, oppure Tutto il catalogo. Puo essere automatica o con codice.",
  fixed_off:
    "Sottrae un importo fisso in euro dal subtotale eleggibile (es. 5 = 5 EUR). Utile per coupon tipo -5 EUR. Imposta Minimo carrello se serve una soglia.",
  free_shipping:
    "Azzera il costo spedizione quando le condizioni sono soddisfatte. Il valore sconto non serve. Controlla minimo carrello o quantita minima.",
  bundle_fixed_price:
    "Quando il cliente acquista almeno Quantita bundle articoli eleggibili, paga un prezzo fisso totale per quel bundle. Es: bundle_quantity=3 e discount_value=25 significa 3 pezzi a 25 EUR totali invece del prezzo pieno.",
  bundle_percent_off:
    "Quando ci sono almeno Quantita bundle articoli eleggibili, applica la percentuale in Sconto/valore solo su quegli articoli. Es: 3 prodotti del gruppo Anime con 20% di sconto.",
  quantity_deal:
    "Se la quantita totale eleggibile raggiunge Quantita minima, applica la percentuale in Sconto/valore sul subtotale eleggibile. Es: min_quantity=2 e discount_value=10 per 10% dal secondo pezzo in poi.",
};

export const PROMOTION_TARGET_LABELS: Record<PromotionTargetType, string> = {
  all: "Tutto il catalogo",
  product: "Prodotto specifico",
  product_group: "Gruppo",
  product_typology: "Tipologia",
};

export type PromotionWithTargets = {
  id: string;
  name: string;
  code: string | null;
  promotion_type: PromotionType;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  usage_limit: number | null;
  usage_count: number;
  min_cart_amount: number | null;
  min_quantity: number;
  discount_value: number;
  bundle_quantity: number | null;
  requires_code: boolean;
  usage_instructions: string;
  admin_notes: string | null;
  promotion_targets: {
    id: string;
    target_type: PromotionTargetType;
    target_id: string | null;
  }[];
};

export type PromoCartLine = {
  productId: string | null;
  productGroupId: string | null;
  productTypologyId: string | null;
  quantity: number;
  lineTotal: number;
  isCustom: boolean;
};

export type AppliedPromotionResult = {
  promotionId: string | null;
  promotionCode: string | null;
  promotionName: string | null;
  discountAmount: number;
  freeShipping: boolean;
  subtotalAfterDiscount: number;
};
