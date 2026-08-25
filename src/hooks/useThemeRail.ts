import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME_ID, getTheme, type TrainTheme } from "@/data/themes";

const STORAGE_KEY = "rail-musafir-theme";

export function useThemeRail() {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const theme = getTheme(themeId);

  const applyTheme = useCallback((t: TrainTheme) => {
    const root = document.documentElement;
    const c = t.colors;
    const set = (k: string, v: string) => root.style.setProperty(k, v);

    set("--bg-a", c.bg[0]);
    set("--bg-b", c.bg[1]);
    set("--bg-c", c.bg[2]);
    set("--glow", c.glow);
    set("--ink", c.ink);
    set("--ink-soft", c.inkSoft);
    set("--ink-faint", c.inkFaint);
    set("--accent", c.accent);
    set("--accent-2", c.accent2);
    set("--accent-ink", c.accentInk);
    set("--panel", c.panel);
    set("--panel-border", c.panelBorder);
    set("--edge", c.edge);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", c.bg[1]);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    document.documentElement.style.colorScheme = "dark";
    try {
      window.localStorage.setItem(STORAGE_KEY, theme.id);
    } catch {
      /* private mode */
    }
  }, [theme, applyTheme]);

  const selectTheme = useCallback((id: string) => setThemeId(id), []);

  return { theme, themeId, selectTheme };
}
