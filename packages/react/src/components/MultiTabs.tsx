import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useMultiTabs } from "@/hooks/useMultiTabs";
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
// Theme helper
// ---------------------------------------------------------------------------

function buildThemeVars(theme?: MultiTabsTheme): CSSProperties {
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
    const val = theme[key as keyof MultiTabsTheme];
    if (val !== undefined) result[cssVar] = val;
  }
  return result as CSSProperties;
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

  const [activeTabMenuId, setActiveTabMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const draggingTabIdRef = useRef<string | null>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListId = useId();

  const themeVars = buildThemeVars(theme);

  const getTabLabel = useCallback((tab: MultiTabItem) => {
    const metadata = tab.metadata;
    const caseNumber =
      typeof metadata?.caseNumber === "string" ? metadata.caseNumber : null;
    const caseTitle =
      typeof metadata?.caseTitle === "string" ? metadata.caseTitle : null;

    return caseNumber && caseTitle ? `[${caseNumber}] ${caseTitle}` : tab.title;
  }, []);

  const closeAllMenus = useCallback(() => {
    setActiveTabMenuId(null);
    setDropdownOpen(false);
  }, []);

  const focusTabButton = useCallback((tabId: string) => {
    const button = tabButtonRefs.current[tabId];
    if (!button) return;
    button.focus();
  }, []);

  // --- Handlers ---

  const handleTabClick = useCallback(
    (tab: MultiTabItem) => {
      closeAllMenus();
      openTab(tab);
    },
    [closeAllMenus, openTab],
  );

  const handleCloseTab = useCallback(
    (tab: MultiTabItem) => {
      setActiveTabMenuId((prev) => (prev === tab.id ? null : prev));
      closeTab(tab);
    },
    [closeTab],
  );

  const handleCloseAllTabs = useCallback(() => {
    closeAllMenus();
    closeAllTabs();
  }, [closeAllMenus, closeAllTabs]);

  const handleReloadTab = useCallback(
    (tab: MultiTabItem) => {
      closeAllMenus();
      reloadTab(tab);
    },
    [closeAllMenus, reloadTab],
  );

  const handleTabContextMenu = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.preventDefault();
      setDropdownOpen(false);
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setActiveTabMenuId((prev) => (prev === tabId ? null : tabId));
    },
    [],
  );

  const handleDropdownToggle = useCallback(() => {
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }

    setActiveTabMenuId(null);

    const rect = dropdownButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPosition({ x: rect.right, y: rect.bottom + 4 });
    }

    setDropdownOpen(true);
  }, [dropdownOpen]);

  const handleDragStart = useCallback(
    (tab: MultiTabItem, e: React.DragEvent) => {
      draggingTabIdRef.current = tab.id;
      e.dataTransfer.setData("text/plain", tab.id);
    },
    [],
  );

  const handleDragOver = useCallback(
    (tab: MultiTabItem, e: React.DragEvent) => {
      e.preventDefault();
      if (draggingTabIdRef.current && draggingTabIdRef.current !== tab.id) {
        setDragOverTabId(tab.id);
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (tab: MultiTabItem, e: React.DragEvent) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== tab.id) moveTab(sourceId, tab.id);
      setDragOverTabId(null);
    },
    [moveTab],
  );

  const handleDragEnd = useCallback(() => {
    draggingTabIdRef.current = null;
    setDragOverTabId(null);
  }, []);

  const handleTabKeyDown = useCallback(
    (tab: MultiTabItem, event: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = tabs.findIndex((item) => item.id === tab.id);
      if (currentIndex === -1) return;

      const focusAndOpenTab = (target: MultiTabItem) => {
        openTab(target);
        requestAnimationFrame(() => {
          focusTabButton(target.id);
        });
      };

      switch (event.key) {
        case "ArrowRight": {
          event.preventDefault();
          const nextTab = tabs[(currentIndex + 1) % tabs.length];
          if (nextTab) focusAndOpenTab(nextTab);
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          const previousIndex =
            currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          const previousTab = tabs[previousIndex];
          if (previousTab) focusAndOpenTab(previousTab);
          break;
        }
        case "Home": {
          event.preventDefault();
          const firstTab = tabs[0];
          if (firstTab) focusAndOpenTab(firstTab);
          break;
        }
        case "End": {
          event.preventDefault();
          const lastTab = tabs[tabs.length - 1];
          if (lastTab) focusAndOpenTab(lastTab);
          break;
        }
        case "Delete": {
          if (tabs.length <= 1) return;

          event.preventDefault();
          const fallbackTab =
            tabs[currentIndex + 1] ?? tabs[currentIndex - 1] ?? null;

          closeTab(tab);

          if (fallbackTab) {
            requestAnimationFrame(() => {
              focusTabButton(fallbackTab.id);
            });
          }
          break;
        }
      }
    },
    [closeTab, focusTabButton, openTab, tabs],
  );

  useEffect(() => {
    for (const tabId of Object.keys(tabButtonRefs.current)) {
      if (!tabs.some((tab) => tab.id === tabId)) {
        delete tabButtonRefs.current[tabId];
      }
    }
  }, [tabs]);

  const showOverlay = activeTabMenuId !== null || dropdownOpen;

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
            <div
              key={tab.id}
              className={`drm-multitabs__tab-group${dragOverTabId === tab.id ? " drm-multitabs__tab-group--drag-over" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(tab, e)}
              onDragOver={(e) => handleDragOver(tab, e)}
              onDrop={(e) => handleDrop(tab, e)}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleTabContextMenu(tab.id, e)}
            >
              <div className="drm-multitabs__tab-shell">
                {/* Tab button */}
                <button
                  className={`drm-multitabs__tab${tab.id === currentTabId ? " drm-multitabs__tab--active" : ""}`}
                  type="button"
                  role="tab"
                  id={`${tabListId}-${tab.id}`}
                  ref={(element) => {
                    tabButtonRefs.current[tab.id] = element;
                  }}
                  aria-selected={tab.id === currentTabId}
                  tabIndex={tab.id === currentTabId ? 0 : -1}
                  title={getTabLabel(tab)}
                  onClick={() => handleTabClick(tab)}
                  onKeyDown={(event) => handleTabKeyDown(tab, event)}
                >
                  {/* Icon */}
                  {tabIcon ? (
                    tabIcon(tab)
                  ) : tab.icon && tab.icon !== "circle" ? (
                    <span
                      className="drm-multitabs__tab-icon"
                      aria-hidden="true"
                    >
                      {tab.icon}
                    </span>
                  ) : null}

                  {/* Label */}
                  <span className="drm-multitabs__tab-label">
                    {getTabLabel(tab)}
                  </span>
                </button>

                {/* Context menu rendered via portal to avoid overflow:hidden clipping */}

                {/* Close button */}
                <button
                  className="drm-multitabs__close"
                  type="button"
                  aria-label={`Close ${tab.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab);
                  }}
                >
                  {closeIcon}
                </button>
              </div>
            </div>
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

      {/* Context menu portal — escapes overflow:hidden and stacking contexts */}
      {activeTabMenuId !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Overlay inside portal so it shares the same stacking context */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              onClick={closeAllMenus}
            />
            <div
              className="drm-multitabs__menu-card drm-multitabs__context-menu"
              role="menu"
              style={{
                position: "fixed",
                left: menuPosition.x,
                top: menuPosition.y,
                zIndex: 9999,
                minWidth: 160,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {tabs
                .filter((tab) => tab.id === activeTabMenuId)
                .map((tab) => (
                  <React.Fragment key={tab.id}>
                    <button
                      className="drm-multitabs__menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => handleReloadTab(tab)}
                    >
                      {menuIconReload} Reload Tab
                    </button>
                    <button
                      className="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
                      type="button"
                      role="menuitem"
                      onClick={() => handleCloseTab(tab)}
                    >
                      {menuIconClose} Close Tab
                    </button>
                  </React.Fragment>
                ))}
            </div>
          </>,
          document.body,
        )}

      {dropdownOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="drm-multitabs__menu-card drm-multitabs__dropdown-menu"
            role="menu"
            style={{
              position: "fixed",
              top: dropdownPosition.y,
              left: Math.max(12, dropdownPosition.x - 160),
              zIndex: 9999,
              minWidth: 160,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`drm-multitabs__menu-item${tab.id === currentTabId ? " drm-multitabs__menu-item--active" : ""}`}
                type="button"
                role="menuitem"
                onClick={() => {
                  closeAllMenus();
                  openTab(tab);
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                margin: "4px 0",
              }}
            />
            <button
              className="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
              type="button"
              role="menuitem"
              onClick={handleCloseAllTabs}
            >
              {menuIconClose} Close All Tabs
            </button>
          </div>,
          document.body,
        )}
    </nav>
  );
}
