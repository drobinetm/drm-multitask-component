import type { CSSProperties } from "react";
import type { MultiTabsTheme } from "../types";

export function buildThemeVars(theme?: MultiTabsTheme): CSSProperties {
  if (!theme) return {};

  const map: Record<keyof MultiTabsTheme, string> = {
    height: "--drm-tabs-height",
    shellBg: "--drm-tabs-shell-bg",
    tabBg: "--drm-tabs-tab-bg",
    tabColor: "--drm-tabs-tab-color",
    activeTabBg: "--drm-tabs-active-bg",
    activeTabColor: "--drm-tabs-active-color",
    activeTabBorderColor: "--drm-tabs-active-border-color",
    borderRadius: "--drm-tabs-border-radius",
    fontSize: "--drm-tabs-font-size",
    tabMaxWidth: "--drm-tabs-tab-max-width",
    tabMinWidth: "--drm-tabs-tab-min-width",
    closeHoverColor: "--drm-tabs-close-hover-color",
    dragOverColor: "--drm-tabs-drag-over-border",
  };

  const result: Record<string, string> = {};

  for (const [key, cssVar] of Object.entries(map)) {
    const value = theme[key as keyof MultiTabsTheme];
    if (value !== undefined) {
      result[cssVar] = value;
    }
  }

  return result as CSSProperties;
}
