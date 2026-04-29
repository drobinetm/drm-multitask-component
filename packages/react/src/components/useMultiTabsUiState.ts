import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { MultiTabItem } from "../types";

interface UseMultiTabsUiStateArgs {
  tabs: MultiTabItem[];
  currentTabId: string;
  openTab: (tab: MultiTabItem) => void;
  closeTab: (tab: MultiTabItem) => void;
  closeAllTabs: () => void;
  moveTab: (sourceId: string, targetId: string) => void;
  reloadTab: (tab: MultiTabItem) => void;
}

export function useMultiTabsUiState({
  tabs,
  currentTabId: _currentTabId,
  openTab,
  closeTab,
  closeAllTabs,
  moveTab,
  reloadTab,
}: UseMultiTabsUiStateArgs) {
  const [activeTabMenuId, setActiveTabMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const draggingTabIdRef = useRef<string | null>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListId = useId();

  const closeAllMenus = useCallback(() => {
    setActiveTabMenuId(null);
    setDropdownOpen(false);
  }, []);

  const handleTabButtonRef = useCallback(
    (tabId: string, element: HTMLButtonElement | null) => {
      tabButtonRefs.current[tabId] = element;
    },
    [],
  );

  const focusTabButton = useCallback((tabId: string) => {
    const button = tabButtonRefs.current[tabId];
    if (!button) return;
    button.focus();
  }, []);

  const handleTabClick = useCallback(
    (tab: MultiTabItem) => {
      closeAllMenus();
      openTab(tab);
    },
    [closeAllMenus, openTab],
  );

  const handleCloseTab = useCallback(
    (tab: MultiTabItem) => {
      closeAllMenus();
      closeTab(tab);
    },
    [closeAllMenus, closeTab],
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
    (tabId: string, event: MouseEvent) => {
      event.preventDefault();
      setDropdownOpen(false);
      setMenuPosition({ x: event.clientX, y: event.clientY });
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

  const handleDragStart = useCallback((tab: MultiTabItem, event: DragEvent) => {
    draggingTabIdRef.current = tab.id;
    event.dataTransfer.setData("text/plain", tab.id);
  }, []);

  const handleDragOver = useCallback((tab: MultiTabItem, event: DragEvent) => {
    event.preventDefault();
    if (draggingTabIdRef.current && draggingTabIdRef.current !== tab.id) {
      setDragOverTabId(tab.id);
    }
  }, []);

  const handleDrop = useCallback(
    (tab: MultiTabItem, event: DragEvent) => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== tab.id) {
        moveTab(sourceId, tab.id);
      }
      setDragOverTabId(null);
    },
    [moveTab],
  );

  const handleDragEnd = useCallback(() => {
    draggingTabIdRef.current = null;
    setDragOverTabId(null);
  }, []);

  const handleTabKeyDown = useCallback(
    (tab: MultiTabItem, event: KeyboardEvent<HTMLButtonElement>) => {
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

  useEffect(() => {
    if (activeTabMenuId === null && !dropdownOpen) {
      return;
    }

    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllMenus();
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [activeTabMenuId, closeAllMenus, dropdownOpen]);

  const activeMenuTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabMenuId) ?? null,
    [activeTabMenuId, tabs],
  );

  return {
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
    showOverlay: activeTabMenuId !== null || dropdownOpen,
  };
}
