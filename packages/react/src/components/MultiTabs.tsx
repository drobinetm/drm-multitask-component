import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useMultiTabs } from "@/hooks/useMultiTabs";
import { TabRailItem } from "./TabRailItem";
import { TabContextMenuPortal, TabDropdownPortal } from "./MultiTabsPortals";
import { buildThemeVars } from "./multiTabsTheme";
import { useMultiTabsUiState } from "./useMultiTabsUiState";
import type {
  MultiTabItem,
  MultiTabsTheme,
  UseMultiTabsOptions,
  UseMultiTabsReturn,
} from "@/types";
import "@/styles/multitabs.css";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const MultiTabsContext = createContext<UseMultiTabsReturn | null>(null);

function useMultiTabsContext(): UseMultiTabsReturn {
  const ctx = useContext(MultiTabsContext);
  if (!ctx) {
    throw new Error(
      "[@drobinetm/multitabs-react] useMultiTabsContext must be used within <MultiTabsProvider>",
    );
  }
  return ctx;
}

export function useMultiTabsController(): UseMultiTabsReturn {
  return useMultiTabsContext();
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface MultiTabsProviderProps {
  children: ReactNode;
  options?: UseMultiTabsOptions;
}

export function MultiTabsProvider({
  children,
  options,
}: MultiTabsProviderProps) {
  const multiTabs = useMultiTabs(options);
  return (
    <MultiTabsContext.Provider value={multiTabs}>
      {children}
    </MultiTabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Slot props types
// ---------------------------------------------------------------------------

interface MultiTabsSlots {
  /** Custom launcher icon */
  launcherIcon?: ReactNode;
  /** Custom tab icon renderer */
  tabIcon?: (tab: MultiTabItem) => ReactNode;
  /** Custom close icon */
  closeIcon?: ReactNode;
  /** Custom dropdown icon */
  dropdownIcon?: ReactNode;
  /** Custom reload menu icon */
  menuIconReload?: ReactNode;
  /** Custom close menu icon */
  menuIconClose?: ReactNode;
}

// ---------------------------------------------------------------------------
// MultiTabs component
// ---------------------------------------------------------------------------

interface MultiTabsProps extends MultiTabsSlots {
  theme?: MultiTabsTheme;
  className?: string;
  style?: CSSProperties;
}

export function MultiTabs({
  theme,
  className,
  style,
  launcherIcon = "⊞",
  tabIcon,
  closeIcon = "✕",
  dropdownIcon = "▾",
  menuIconReload = "↺",
  menuIconClose = "✕",
}: MultiTabsProps) {
  const {
    tabs,
    currentTabId,
    openTab,
    closeTab,
    closeAllTabs,
    moveTab,
    reloadTab,
  } = useMultiTabsContext();

  const themeVars = useMemo(() => buildThemeVars(theme), [theme]);
  const {
    activeMenuTab,
    menuPosition,
    dropdownPosition,
    dragOverTabId,
    dropdownOpen,
    dropdownButtonRef,
    tabListId,
    closeAllMenus,
    handleTabButtonRef,
    handleTabClick,
    handleCloseTab,
    handleCloseAllTabs,
    handleReloadTab,
    handleTabContextMenu,
    handleDropdownToggle,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTabKeyDown,
    showOverlay,
  } = useMultiTabsUiState({
    tabs,
    currentTabId,
    openTab,
    closeTab,
    closeAllTabs,
    moveTab,
    reloadTab,
  });

  return (
    <nav
      className={`drm-multitabs${className ? ` ${className}` : ""}`}
      style={{ ...themeVars, ...style }}
    >
      <div className="drm-multitabs__shell">
        {/* Launcher */}
        <button
          className="drm-multitabs__launcher"
          type="button"
          aria-label="Navigation launcher"
        >
          <span className="drm-multitabs__icon">{launcherIcon}</span>
        </button>

        {/* Tab rail */}
        <div
          className="drm-multitabs__rail"
          role="tablist"
          aria-label="Open tabs"
          aria-orientation="horizontal"
        >
          {tabs.map((tab) => (
            <TabRailItem
              key={tab.id}
              tab={tab}
              currentTabId={currentTabId}
              dragOverTabId={dragOverTabId}
              tabListId={tabListId}
              tabIcon={tabIcon}
              closeIcon={closeIcon}
              onTabButtonRef={handleTabButtonRef}
              onTabClick={handleTabClick}
              onCloseTab={handleCloseTab}
              onTabKeyDown={handleTabKeyDown}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onContextMenu={handleTabContextMenu}
            />
          ))}
        </div>

        {/* Dropdown */}
        <div
          className="drm-multitabs__dropdown-wrapper"
          style={{ position: "relative", flexShrink: 0 }}
        >
          <button
            ref={dropdownButtonRef}
            className="drm-multitabs__dropdown"
            type="button"
            aria-label="All tabs"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            onClick={handleDropdownToggle}
          >
            {dropdownIcon}
          </button>
        </div>
      </div>

      {/* Overlay to close menus */}
      {showOverlay && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={closeAllMenus}
        />
      )}

      <TabContextMenuPortal
        tab={activeMenuTab}
        menuPosition={menuPosition}
        menuIconReload={menuIconReload}
        menuIconClose={menuIconClose}
        onReloadTab={handleReloadTab}
        onCloseTab={handleCloseTab}
        onCloseMenus={closeAllMenus}
      />

      {dropdownOpen ? (
        <TabDropdownPortal
          tabs={tabs}
          currentTabId={currentTabId}
          dropdownPosition={dropdownPosition}
          menuIconClose={menuIconClose}
          onOpenTab={openTab}
          onCloseAllTabs={handleCloseAllTabs}
          onCloseMenus={closeAllMenus}
        />
      ) : null}
    </nav>
  );
}
