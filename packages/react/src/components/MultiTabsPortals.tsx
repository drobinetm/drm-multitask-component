import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type { MultiTabItem } from "../types";

interface TabContextMenuPortalProps {
  tab: MultiTabItem | null;
  menuPosition: { x: number; y: number };
  menuIconReload: ReactNode;
  menuIconClose: ReactNode;
  onReloadTab: (tab: MultiTabItem) => void;
  onCloseTab: (tab: MultiTabItem) => void;
  onCloseMenus: () => void;
}

interface TabDropdownPortalProps {
  tabs: MultiTabItem[];
  currentTabId: string;
  dropdownPosition: { x: number; y: number };
  menuIconClose: ReactNode;
  onOpenTab: (tab: MultiTabItem) => void;
  onCloseAllTabs: () => void;
  onCloseMenus: () => void;
}

export function TabContextMenuPortal({
  tab,
  menuPosition,
  menuIconReload,
  menuIconClose,
  onReloadTab,
  onCloseTab,
  onCloseMenus,
}: TabContextMenuPortalProps) {
  if (tab === null || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        onClick={onCloseMenus}
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
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="drm-multitabs__menu-item"
          type="button"
          role="menuitem"
          onClick={() => onReloadTab(tab)}
        >
          {menuIconReload} Reload Tab
        </button>
        <button
          className="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
          type="button"
          role="menuitem"
          onClick={() => onCloseTab(tab)}
        >
          {menuIconClose} Close Tab
        </button>
      </div>
    </>,
    document.body,
  );
}

export function TabDropdownPortal({
  tabs,
  currentTabId,
  dropdownPosition,
  menuIconClose,
  onOpenTab,
  onCloseAllTabs,
  onCloseMenus,
}: TabDropdownPortalProps) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
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
      onClick={(event) => event.stopPropagation()}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`drm-multitabs__menu-item${tab.id === currentTabId ? " drm-multitabs__menu-item--active" : ""}`}
          type="button"
          role="menuitem"
          onClick={() => {
            onCloseMenus();
            onOpenTab(tab);
          }}
        >
          {tab.title}
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
        onClick={onCloseAllTabs}
      >
        {menuIconClose} Close All Tabs
      </button>
    </div>,
    document.body,
  );
}
