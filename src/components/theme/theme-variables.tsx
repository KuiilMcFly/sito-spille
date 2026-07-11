import { getThemeColors } from "@/lib/theme/get-theme";
import { themeVariablesStyle } from "@/lib/theme/generate-palette";

export async function ThemeVariables() {
  const theme = await getThemeColors();
  const css = themeVariablesStyle(theme);

  return <style id="site-theme-variables">{css}</style>;
}
