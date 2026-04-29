// @vitest-environment jsdom

import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  MultiTabs,
  MultiTabsProvider,
  useMultiTabsController,
} from "./MultiTabs";
import {
  bumpTabContainerReload,
  useTabContainerReload,
} from "../hooks/useTabContainerReload";
import { silenceReactRouterFutureWarnings } from "../test/silenceReactRouterWarnings";

silenceReactRouterFutureWarnings();

function ComponentTestShell() {
  return (
    <MemoryRouter initialEntries={["/customers/42"]}>
      <MultiTabsProvider
        options={{
          storageKey: "test-tabs-component",
          resolveTitle: (pathname) => {
            if (pathname === "/customers/42") return "Customer detail";
            if (pathname === "/reports") return "Reports";
            if (pathname === "/settings") return "Settings";
            return null;
          },
        }}
      >
        <MultiTabs />
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route path="customers/:id" element={<ComponentTestPage />} />
            <Route path="reports" element={<ComponentTestPage />} />
            <Route path="settings" element={<ComponentTestPage />} />
          </Route>
        </Routes>
      </MultiTabsProvider>
    </MemoryRouter>
  );
}

function ComponentTestPage() {
  const { currentTab, openTab, tabs } = useMultiTabsController();
  const reloadNonce = useTabContainerReload(currentTab?.id ?? "missing");

  return (
    <div>
      <div data-testid="current-tab-title">{currentTab?.title ?? "none"}</div>
      <div data-testid="tab-order">{tabs.map((tab) => tab.id).join("|")}</div>
      <div data-testid="reload-nonce">{String(reloadNonce)}</div>
      <button
        type="button"
        onClick={() =>
          openTab({
            id: "/reports",
            title: "Reports",
            icon: "report",
            to: "/reports",
            routePath: "/reports",
          })
        }
      >
        Open reports
      </button>
      <button
        type="button"
        onClick={() =>
          openTab({
            id: "/settings",
            title: "Settings",
            icon: "settings",
            to: "/settings",
            routePath: "/settings",
          })
        }
      >
        Open settings
      </button>
    </div>
  );
}

function ReloadSubscriber({
  tabId,
  testId,
}: {
  tabId: string;
  testId: string;
}) {
  const reloadNonce = useTabContainerReload(tabId);
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  return (
    <div data-testid={testId}>{`${renderCountRef.current}:${reloadNonce}`}</div>
  );
}

function ReloadScopeHarness() {
  return (
    <div>
      <ReloadSubscriber tabId="customer-tab" testId="customer-reload-state" />
      <ReloadSubscriber tabId="reports-tab" testId="reports-reload-state" />
      <button
        type="button"
        onClick={() => bumpTabContainerReload("customer-tab")}
      >
        Reload customer tab
      </button>
      <button
        type="button"
        onClick={() => bumpTabContainerReload("reports-tab")}
      >
        Reload reports tab
      </button>
    </div>
  );
}

type DragTransferStub = {
  setData: (key: string, value: string) => void;
  getData: (key: string) => string;
};

function createDragEvent(type: string, dataTransfer?: DragTransferStub) {
  const store = new Map<string, string>();
  const event = new Event(type, { bubbles: true, cancelable: true });
  const transfer = dataTransfer ?? {
    setData: (key: string, value: string) => {
      store.set(key, value);
    },
    getData: (key: string) => store.get(key) ?? "",
  };

  Object.defineProperty(event, "dataTransfer", {
    value: transfer,
  });

  return event as Event & { dataTransfer: DragTransferStub };
}

describe("MultiTabs component", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("opens the context menu and closes the selected tab", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    fireEvent.contextMenu(screen.getByRole("tab", { name: "Reports" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /Close Tab/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: /Close Tab/i }));

    await waitFor(() => {
      expect(screen.queryByRole("tab", { name: "Reports" })).toBeNull();
    });
  });

  it("opens the dropdown menu and navigates to a selected tab", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Settings" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "All tabs" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Reports" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: "Reports" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-tab-title").textContent).toBe(
        "Reports",
      );
      expect(
        screen
          .getByRole("tab", { name: "Reports" })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });
  });

  it("reorders tabs through drag and drop", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    await waitFor(() => {
      expect(screen.getByTestId("tab-order").textContent).toBe(
        "/customers/42|/reports|/settings",
      );
    });

    const settingsGroup = screen
      .getByRole("tab", { name: "Settings" })
      .closest(".drm-multitabs__tab-group");
    const reportsGroup = screen
      .getByRole("tab", { name: "Reports" })
      .closest(".drm-multitabs__tab-group");

    expect(settingsGroup).toBeTruthy();
    expect(reportsGroup).toBeTruthy();

    const dragStartEvent = createDragEvent("dragstart");
    settingsGroup!.dispatchEvent(dragStartEvent);

    const dropEvent = createDragEvent("drop", dragStartEvent.dataTransfer);

    reportsGroup!.dispatchEvent(
      createDragEvent("dragover", dragStartEvent.dataTransfer),
    );
    reportsGroup!.dispatchEvent(dropEvent);
    settingsGroup!.dispatchEvent(createDragEvent("dragend"));

    await waitFor(() => {
      expect(screen.getByTestId("tab-order").textContent).toBe(
        "/customers/42|/settings|/reports",
      );
    });
  });

  it("supports keyboard navigation directly from the rendered tab buttons", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    const customerTab = screen.getByRole("tab", { name: "Customer detail" });
    const reportsTab = screen.getByRole("tab", { name: "Reports" });

    reportsTab.focus();
    fireEvent.keyDown(reportsTab, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(document.activeElement).toBe(customerTab);
      expect(customerTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  it("reloads the active tab from the context menu", async () => {
    render(<ComponentTestShell />);

    expect(screen.getByTestId("reload-nonce").textContent).toBe("0");

    fireEvent.contextMenu(screen.getByRole("tab", { name: "Customer detail" }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Reload Tab/i }),
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: /Reload Tab/i }));

    await waitFor(() => {
      expect(screen.getByTestId("reload-nonce").textContent).toBe("1");
    });
  });

  it("closes dropdown menus when the overlay is clicked", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));
    fireEvent.click(screen.getByRole("button", { name: "All tabs" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Reports" })).toBeTruthy();
    });

    const overlay = Array.from(document.querySelectorAll("div")).find(
      (node) => {
        const element = node as HTMLDivElement;
        return (
          element.style.position === "fixed" && element.style.zIndex === "99"
        );
      },
    ) as HTMLDivElement | undefined;

    expect(overlay).toBeTruthy();

    fireEvent.mouseDown(overlay!);
    fireEvent.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: "Reports" })).toBeNull();
    });
  });

  it("closes all tabs from the dropdown while keeping the active tab", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    await waitFor(() => {
      expect(screen.getByTestId("tab-order").textContent).toBe(
        "/customers/42|/reports|/settings",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "All tabs" }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Close All Tabs/i }),
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: /Close All Tabs/i }));

    await waitFor(() => {
      expect(screen.getByTestId("tab-order").textContent).toBe("/settings");
      expect(screen.getAllByRole("tab")).toHaveLength(1);
      expect(screen.getByTestId("current-tab-title").textContent).toBe(
        "Settings",
      );
    });
  });

  it("closes open menus when the user presses Escape", async () => {
    render(<ComponentTestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "All tabs" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Reports" })).toBeTruthy();
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: "Reports" })).toBeNull();
    });

    fireEvent.contextMenu(screen.getByRole("tab", { name: "Reports" }));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /Close Tab/i })).toBeTruthy();
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: /Close Tab/i })).toBeNull();
    });
  });

  it("notifies only subscribers for the reloaded tab", async () => {
    render(<ReloadScopeHarness />);

    expect(screen.getByTestId("customer-reload-state").textContent).toBe("1:0");
    expect(screen.getByTestId("reports-reload-state").textContent).toBe("1:0");

    fireEvent.click(
      screen.getByRole("button", { name: "Reload customer tab" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("customer-reload-state").textContent).toBe(
        "2:1",
      );
    });

    expect(screen.getByTestId("reports-reload-state").textContent).toBe("1:0");

    fireEvent.click(screen.getByRole("button", { name: "Reload reports tab" }));

    await waitFor(() => {
      expect(screen.getByTestId("reports-reload-state").textContent).toBe(
        "2:1",
      );
    });

    expect(screen.getByTestId("customer-reload-state").textContent).toBe("2:1");
  });
});
