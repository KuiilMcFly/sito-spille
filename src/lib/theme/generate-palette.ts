import { DEFAULT_THEME, type ThemeColors, type ThemeSettings } from "@/lib/theme/defaults";

function normalizeHex(hex: string): string {
  const value = hex.trim().replace("#", "");
  if (value.length === 3) {
    return (
      "#" +
      value
        .split("")
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    );
  }
  if (value.length === 6) {
    return "#" + value.toLowerCase();
  }
  return DEFAULT_THEME.primary;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex).replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
  );
}

function mix(hexA: string, hexB: string, weightB: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return rgbToHex(
    a.r * (1 - w) + b.r * w,
    a.g * (1 - w) + b.g * w,
    a.b * (1 - w) + b.b * w
  );
}

function darken(hex: string, amount: number): string {
  return mix(hex, "#000000", amount);
}

function lighten(hex: string, amount: number): string {
  return mix(hex, "#ffffff", amount);
}

export function buildThemeColors(settings?: ThemeSettings | null): ThemeColors {
  const primary = normalizeHex(settings?.primary || DEFAULT_THEME.primary);
  const accent = normalizeHex(settings?.accent || DEFAULT_THEME.accent);

  return {
    primary,
    accent,
    background: lighten(primary, 0.96),
    brand50: lighten(primary, 0.94),
    brand100: lighten(primary, 0.88),
    brand200: lighten(primary, 0.76),
    brand300: lighten(primary, 0.58),
    brand400: lighten(primary, 0.32),
    brand500: primary,
    brand600: darken(primary, 0.12),
    brand700: darken(primary, 0.24),
    accent500: accent,
    accent600: darken(accent, 0.15),
  };
}

export function themeToCssVariables(theme: ThemeColors): Record<string, string> {
  const rgb = hexToRgb(theme.brand500);
  return {
    "--background": theme.background,
    "--brand-50": theme.brand50,
    "--brand-100": theme.brand100,
    "--brand-200": theme.brand200,
    "--brand-300": theme.brand300,
    "--brand-400": theme.brand400,
    "--brand-500": theme.brand500,
    "--brand-600": theme.brand600,
    "--brand-700": theme.brand700,
    "--accent-500": theme.accent500,
    "--accent-600": theme.accent600,
    "--theme-primary-rgb": rgb.r + ", " + rgb.g + ", " + rgb.b,
    "--theme-accent-rgb":
      hexToRgb(theme.accent500).r +
      ", " +
      hexToRgb(theme.accent500).g +
      ", " +
      hexToRgb(theme.accent500).b,
  };
}

export function themeVariablesStyle(theme: ThemeColors): string {
  const vars = themeToCssVariables(theme);
  const lines = Object.entries(vars).map(([key, value]) => key + ": " + value + ";");
  return ":root {" + lines.join("") + "}";
}

export { normalizeHex };
