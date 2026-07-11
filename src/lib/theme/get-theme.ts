import { getSiteSetting } from "@/lib/settings";
import { buildThemeColors } from "@/lib/theme/generate-palette";
import { DEFAULT_THEME, type ThemeColors, type ThemeSettings } from "@/lib/theme/defaults";

export async function getThemeColors(): Promise<ThemeColors> {
  const settings = await getSiteSetting<ThemeSettings>("theme_colors", {
    primary: DEFAULT_THEME.primary,
    accent: DEFAULT_THEME.accent,
  });

  return buildThemeColors(settings);
}
