import type { DragEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { MultiTabItem } from "../types";

export interface TabRailItemProps {
  tab: MultiTabItem;
  currentTabId: string;
  dragOverTabId: string | null;
  tabListId: string;
  tabIcon: ((tab: MultiTabItem) => ReactNode) | undefined;
  closeIcon: ReactNode;
  onTabButtonRef: (tabId: string, element: HTMLButtonElement | null) => void;
  onTabClick: (tab: MultiTabItem) => void;
  onCloseTab: (tab: MultiTabItem) => void;
  onTabKeyDown: (
    tab: MultiTabItem,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => void;
  onDragStart: (tab: MultiTabItem, event: DragEvent) => void;
  onDragOver: (tab: MultiTabItem, event: DragEvent) => void;
  onDrop: (tab: MultiTabItem, event: DragEvent) => void;
  onDragEnd: () => void;
  onContextMenu: (tabId: string, event: MouseEvent) => void;
}

function renderTabIconContent(
  tab: MultiTabItem,
  tabIcon?: (tab: MultiTabItem) => ReactNode,
): ReactNode {
  if (tabIcon) {
    return tabIcon(tab);
  }

  if (tab.icon && tab.icon !== "circle") {
    return (
      <span className="drm-multitabs__tab-icon" aria-hidden="true">
        {tab.icon}
      </span>
    );
  }

  return null;
}

export function TabRailItem({
  tab,
  currentTabId,
  dragOverTabId,
  tabListId,
  tabIcon,
  closeIcon,
  onTabButtonRef,
  onTabClick,
  onCloseTab,
  onTabKeyDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onContextMenu,
}: TabRailItemProps) {
  const isActive = tab.id === currentTabId;
  const isDragOver = dragOverTabId === tab.id;

  return (
    <div
      className={`drm-multitabs__tab-group${isDragOver ? " drm-multitabs__tab-group--drag-over" : ""}`}
      draggable
      onDragStart={(event) => onDragStart(tab, event)}
      onDragOver={(event) => onDragOver(tab, event)}
      onDrop={(event) => onDrop(tab, event)}
      onDragEnd={onDragEnd}
      onContextMenu={(event) => onContextMenu(tab.id, event)}
    >
      <div className="drm-multitabs__tab-shell">
        <button
          className={`drm-multitabs__tab${isActive ? " drm-multitabs__tab--active" : ""}`}
          type="button"
          role="tab"
          id={`${tabListId}-${tab.id}`}
          ref={(element) => {
            onTabButtonRef(tab.id, element);
          }}
          aria-selected={isActive}
          tabIndex={isActive ? 0 : -1}
          title={tab.title}
          onClick={() => onTabClick(tab)}
          onKeyDown={(event) => onTabKeyDown(tab, event)}
        >
          {renderTabIconContent(tab, tabIcon)}
          <span className="drm-multitabs__tab-label">{tab.title}</span>
        </button>

        <button
          className="drm-multitabs__close"
          type="button"
          aria-label={`Close ${tab.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onCloseTab(tab);
          }}
        >
          {closeIcon}
        </button>
      </div>
    </div>
  );
}
