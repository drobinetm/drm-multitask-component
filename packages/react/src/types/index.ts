import type { To } from "react-router-dom";

/**
 * Represents a single open tab in the MultiTabs component.
 */
export interface MultiTabItem {
  /** Unique stable ID derived from route path + params */
  id: string;
  /** Display title shown in the tab */
  title: string;
  /** Icon identifier string */
  icon: string;
  /** React Router navigation target */
  to: To;
  /** Whether the tab matches a known navigation menu item */
  isMenuItem: boolean;
  /** Route pathname */
  routePath?: string | null;
  /** For special case tabs: the case number */
  caseNumber?: string | null;
  /** For special case tabs: the case title */
  caseTitle?: string | null;
}

/**
 * Theme configuration for the MultiTabs component.
 */
export interface MultiTabsTheme {
  height?: string;
  shellBg?: string;
  tabBg?: string;
  tabColor?: string;
  activeTabBg?: string;
  activeTabColor?: string;
  activeTabBorderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  tabMaxWidth?: string;
  tabMinWidth?: string;
  closeHoverColor?: string;
  dragOverColor?: string;
}

/**
 * Options for configuring the useMultiTabs hook.
 */
export interface UseMultiTabsOptions {
  /** localStorage key for persisting tabs. Default: 'drm-multitabs' */
  storageKey?: string;
  /** Default icon for tabs without a resolved icon. Default: 'circle' */
  defaultIcon?: string;
  /** Maximum number of tabs allowed. Default: unlimited */
  maxTabs?: number;
  /**
   * Resolve a custom title for the current location.
   * If provided, this function is called on every location change.
   */
  resolveTitle?: (pathname: string, search: string) => string | null;
}
