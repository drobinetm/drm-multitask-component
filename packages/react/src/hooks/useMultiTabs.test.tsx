// @vitest-environment jsdom

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
} from "../components/MultiTabs";
import { useTabContainerReload } from "./useTabContainerReload";
import type { UseMultiTabsOptions } from "../types";

function TestShell({
  onBeforeClose,
  onTabOpen,
  onTabClose,
  onTabChange,
}: {
  onBeforeClose?: UseMultiTabsOptions["onBeforeClose"];
  onTabOpen?: UseMultiTabsOptions["onTabOpen"];
  onTabClose?: UseMultiTabsOptions["onTabClose"];
  onTabChange?: UseMultiTabsOptions["onTabChange"];
}) {
  const options: UseMultiTabsOptions = {
    storageKey: "test-tabs",
    resolveTitle: (pathname) =>
      pathname.startsWith("/customers/") ? "Customer detail" : null,
    ...(onBeforeClose ? { onBeforeClose } : {}),
    ...(onTabOpen ? { onTabOpen } : {}),
    ...(onTabClose ? { onTabClose } : {}),
    ...(onTabChange ? { onTabChange } : {}),
  };

  return (
    <MemoryRouter
      initialEntries={["/customers/42?caseNumber=C-42&caseTitle=Open"]}
    >
      <MultiTabsProvider options={options}>
        <MultiTabs />
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route path="customers/:id" element={<Page label="Customers" />} />
            <Route path="reports" element={<Page label="Reports" />} />
          </Route>
        </Routes>
      </MultiTabsProvider>
    </MemoryRouter>
  );
}

function Page({ label }: { label: string }) {
  const { currentTab, openTab, closeAllTabs } = useMultiTabsController();
  const nonce = useTabContainerReload(currentTab?.id ?? "missing");

  return (
    <div>
      <div data-testid="page-label">{label}</div>
      <div data-testid="current-tab-title">{currentTab?.title ?? "none"}</div>
      <div data-testid="reload-nonce">{String(nonce)}</div>
      <button
        type="button"
        onClick={() =>
          openTab({
            id: "/reports",
            title: "Reports",
            icon: "report",
            to: "/reports",
            routePath: "/reports",
            metadata: { unsaved: true },
          })
        }
      >
        Open reports
      </button>
      <button type="button" onClick={() => closeAllTabs()}>
        Close all from page
      </button>
    </div>
  );
}

describe("useMultiTabs React integration", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("shares provider state through useMultiTabsController", async () => {
    render(<TestShell />);

    expect(screen.getByTestId("current-tab-title").textContent).toBe(
      "Customer detail",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByTestId("page-label").textContent).toBe("Reports");
    });

    expect(
      screen
        .getByRole("tab", { name: "Reports" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("prevents closing when onBeforeClose returns false", async () => {
    const onBeforeClose = vi.fn(() => false);

    render(<TestShell onBeforeClose={onBeforeClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText("Close Reports"));

    expect(onBeforeClose).toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
  });

  it("emits lifecycle callbacks for tab open, change, and close", async () => {
    const onTabOpen = vi.fn();
    const onTabClose = vi.fn();
    const onTabChange = vi.fn();

    render(
      <TestShell
        onTabOpen={onTabOpen}
        onTabClose={onTabClose}
        onTabChange={onTabChange}
      />,
    );

    await waitFor(() => {
      expect(onTabOpen).toHaveBeenCalled();
      expect(onTabChange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(onTabOpen).toHaveBeenCalledTimes(2);
      expect(onTabChange).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByLabelText("Close Reports"));

    await waitFor(() => {
      expect(onTabClose).toHaveBeenCalledWith(
        expect.objectContaining({ id: "/reports", title: "Reports" }),
      );
    });
  });

  it("updates reload nonce when a tab is reloaded", async () => {
    render(<TestShell />);

    expect(screen.getByTestId("reload-nonce").textContent).toBe("0");

    fireEvent.contextMenu(
      screen.getByRole("tab", { name: /Customer detail/i }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /Reload Tab/i }));

    await waitFor(() => {
      expect(screen.getByTestId("reload-nonce").textContent).toBe("1");
    });
  });

  it("resolves icon and title from resolveTab for route-driven tabs", async () => {
    const options: UseMultiTabsOptions = {
      storageKey: "test-tabs-resolve-tab",
      resolveTab: (location, context) => {
        if (location.pathname === "/customers/42") {
          return {
            title: "Resolved customer",
            icon: "user",
            metadata: {
              ...context.defaultTab.metadata,
              source: "resolver",
            },
          };
        }

        return undefined;
      },
    };

    render(
      <MemoryRouter initialEntries={["/customers/42"]}>
        <MultiTabsProvider options={options}>
          <MultiTabs tabIcon={(tab) => <span>{tab.icon}</span>} />
          <Routes>
            <Route path="/customers/:id" element={<Page label="Customers" />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "Resolved customer" }),
      ).toBeTruthy();
    });

    expect(screen.getByText("user")).toBeTruthy();
    expect(screen.getByTestId("current-tab-title").textContent).toBe(
      "Resolved customer",
    );
  });

  it("keeps resolveTitle working when resolveTab is not provided", async () => {
    render(<TestShell />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Customer detail" })).toBeTruthy();
    });

    expect(screen.getByTestId("current-tab-title").textContent).toBe(
      "Customer detail",
    );
  });

  it("does not render the default 'circle' fallback as visible text", async () => {
    render(<TestShell />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Customer detail" })).toBeTruthy();
    });

    expect(document.querySelector(".drm-multitabs__tab-icon")).toBeNull();
    expect(screen.queryByText("circle")).toBeNull();
  });

  it("supports hiding icons when resolveTab returns null icon", async () => {
    const options: UseMultiTabsOptions = {
      storageKey: "test-tabs-null-resolved-icon",
      resolveTab: () => ({
        title: "Resolved customer",
        icon: null,
      }),
    };

    render(
      <MemoryRouter initialEntries={["/customers/42"]}>
        <MultiTabsProvider options={options}>
          <MultiTabs />
          <Routes>
            <Route path="/customers/:id" element={<Page label="Customers" />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "Resolved customer" }),
      ).toBeTruthy();
    });

    expect(document.querySelector(".drm-multitabs__tab-icon")).toBeNull();
  });

  it("supports arrow and home-end keyboard navigation for tabs", async () => {
    render(<TestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    const customerTab = screen.getByRole("tab", { name: /Customer detail/i });
    const reportsTab = screen.getByRole("tab", { name: "Reports" });

    reportsTab.focus();
    fireEvent.keyDown(reportsTab, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(document.activeElement).toBe(customerTab);
      expect(customerTab.getAttribute("aria-selected")).toBe("true");
    });

    fireEvent.keyDown(customerTab, { key: "End" });

    await waitFor(() => {
      expect(document.activeElement).toBe(reportsTab);
      expect(reportsTab.getAttribute("aria-selected")).toBe("true");
    });

    fireEvent.keyDown(reportsTab, { key: "Home" });

    await waitFor(() => {
      expect(document.activeElement).toBe(customerTab);
      expect(customerTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  it("closes the focused tab with Delete and moves focus to a remaining tab", async () => {
    render(<TestShell />);

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Reports" })).toBeTruthy();
    });

    const reportsTab = screen.getByRole("tab", { name: "Reports" });
    const customerTab = screen.getByRole("tab", { name: /Customer detail/i });

    reportsTab.focus();
    fireEvent.keyDown(reportsTab, { key: "Delete" });

    await waitFor(() => {
      expect(screen.queryByRole("tab", { name: "Reports" })).toBeNull();
      expect(document.activeElement).toBe(customerTab);
      expect(customerTab.getAttribute("aria-selected")).toBe("true");
    });
  });
});
