export type HeroProductPosition = "left" | "center" | "right";

export const HERO_PRODUCT_POSITIONS: { value: HeroProductPosition; label: string }[] = [
  { value: "left", label: "Sinistra" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Destra" },
];

export function parseHeroProductPosition(value: string | null | undefined): HeroProductPosition {
  if (value === "left" || value === "center" || value === "right") return value;
  return "center";
}
