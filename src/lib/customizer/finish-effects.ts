export const FINISH_EFFECTS = [
  { value: "glossy", label: "Lucido (standard)" },
  { value: "matte", label: "Opaco / Matte" },
  { value: "holographic", label: "Olografico" },
  { value: "glitter", label: "Brillantini / Glitter" },
  { value: "rainbow", label: "Arcobaleno olografico" },
  { value: "soft_touch", label: "Soft touch (vellutato)" },
  { value: "epoxy_dome", label: "Cupola epoxy (domed)" },
] as const;

export function getFinishEffectLabel(value?: string) {
  const found = FINISH_EFFECTS.find((e) => e.value === value);
  return found?.label || "Lucido (standard)";
}

export function getFinishOverlayStyle(effect?: string): Record<string, string | number> {
  if (effect === "matte") return { opacity: 0.15, background: "#888" };
  if (effect === "holographic") return { opacity: 0.25, background: "linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)" };
  if (effect === "glitter") return { opacity: 0.2, background: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "8px 8px" };
  if (effect === "rainbow") return { opacity: 0.2, background: "linear-gradient(90deg, red, orange, yellow, green, blue, violet)" };
  if (effect === "soft_touch") return { opacity: 0.1, background: "#333" };
  if (effect === "epoxy_dome") return { opacity: 0.15, background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent)" };
  return {};
}
