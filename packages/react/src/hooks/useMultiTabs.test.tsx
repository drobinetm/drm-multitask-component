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
import {
  BrowserRouter,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import {
  MultiTabs,
  MultiTabsProvider,
  useMultiTabsController,
} from "../components/MultiTabs";
import type { UseMultiTabsOptions } from "../types";
import { silenceReactRouterFutureWarnings } from "../test/silenceReactRouterWarnings";

silenceReactRouterFutureWarnings();

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
    <MemoryRouter initialEntries={["/customers/42"]}>
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

  return (
    <div>
      <div data-testid="page-label">{label}</div>
      <div data-testid="current-tab-title">{currentTab?.title ?? "none"}</div>
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

function BrowserRouterShell() {
  return (
    <BrowserRouter>
      <MultiTabsProvider
        options={{
          storageKey: "test-tabs-browser-router",
          resolveTitle: (pathname) => {
            if (pathname === "/customers/42") return "Customer detail";
            if (pathname === "/reports") return "Reports";
            return null;
          },
        }}
      >
        <MultiTabs />
        <Routes>
          <Route path="/customers/:id" element={<Page label="Customers" />} />
          <Route path="/reports" element={<Page label="Reports" />} />
        </Routes>
      </MultiTabsProvider>
    </BrowserRouter>
  );
}

function BrowserRouterSearchShell() {
  return (
    <BrowserRouter>
      <MultiTabsProvider
        options={{
          storageKey: "test-tabs-browser-router-search",
          resolveTitle: (pathname, search) => {
            if (pathname !== "/customers/42") return null;

            const params = new URLSearchParams(search);
            return params.get("view") === "timeline"
              ? "Customer timeline"
              : "Customer detail";
          },
        }}
      >
        <MultiTabs />
        <Routes>
          <Route
            path="/customers/:id"
            element={<SearchAwarePage label="Customers" />}
          />
        </Routes>
      </MultiTabsProvider>
    </BrowserRouter>
  );
}

function SearchAwarePage({ label }: { label: string }) {
  const { currentTab, openTab } = useMultiTabsController();

  return (
    <div>
      <div data-testid="page-label">{label}</div>
      <div data-testid="current-location-search">{window.location.search}</div>
      <div data-testid="current-tab-title">{currentTab?.title ?? "none"}</div>
      <button
        type="button"
        onClick={() =>
          openTab({
            id: "/customers/42",
            title: "Customer timeline",
            icon: "user",
            to: {
              pathname: "/customers/42",
              search: "?view=timeline",
            },
            routePath: "/customers/42",
          })
        }
      >
        Open timeline view
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
        screen.getByRole("tab", { name: /Resolved customer/i }),
      ).toBeTruthy();
    });

    expect(screen.getByText("user")).toBeTruthy();
    expect(screen.getByTestId("current-tab-title").textContent).toBe(
      "Resolved customer",
    );
  });

  it("keeps route sync stable when resolveTab returns fresh objects", async () => {
    const onTabChange = vi.fn();

    render(
      <MemoryRouter initialEntries={["/customers/42"]}>
        <MultiTabsProvider
          options={{
            storageKey: "test-tabs-stable-sync",
            onTabChange,
            resolveTab: (_location, context) => ({
              title: context.defaultTab.title,
              metadata: {
                ...context.defaultTab.metadata,
                refreshedBy: "resolver",
              },
            }),
          }}
        >
          <MultiTabs />
          <Routes>
            <Route path="/customers/:id" element={<Page label="Customers" />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "42" })).toBeTruthy();
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 25);
    });

    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it("tracks the active tab when resolveTab returns a custom id", async () => {
    render(
      <MemoryRouter initialEntries={["/customers/42"]}>
        <MultiTabsProvider
          options={{
            storageKey: "test-tabs-custom-id",
            resolveTab: (location, context) => {
              if (!location.pathname.startsWith("/customers/")) {
                return undefined;
              }

              const customerId = location.pathname.split("/").pop();

              return {
                id: `customer:${customerId}`,
                title: `Customer ${customerId}`,
                icon: "user",
                metadata: {
                  ...context.defaultTab.metadata,
                  customerId,
                },
              };
            },
          }}
        >
          <MultiTabs />
          <Routes>
            <Route path="/customers/:id" element={<Page label="Customers" />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Customer 42" })).toBeTruthy();
    });

    expect(screen.getByTestId("current-tab-title").textContent).toBe(
      "Customer 42",
    );
    expect(
      screen
        .getByRole("tab", { name: "Customer 42" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("deduplicates persisted tabs when resolveTab returns a custom id", async () => {
    window.localStorage.setItem(
      "test-tabs-custom-id-dedup",
      JSON.stringify([
        {
          id: "customer:42",
          title: "Customer 42",
          icon: "user",
          to: { pathname: "/customers/42", search: "", hash: "" },
          routePath: "/customers/42",
          metadata: { customerId: "42" },
        },
        {
          id: "customer:42",
          title: "Customer 42",
          icon: "user",
          to: { pathname: "/customers/42", search: "", hash: "" },
          routePath: "/customers/42",
          metadata: { customerId: "42" },
        },
      ]),
    );

    render(
      <MemoryRouter initialEntries={["/customers/42"]}>
        <MultiTabsProvider
          options={{
            storageKey: "test-tabs-custom-id-dedup",
            resolveTab: (location, context) => {
              if (!location.pathname.startsWith("/customers/")) {
                return undefined;
              }

              const customerId = location.pathname.split("/").pop();

              return {
                id: `customer:${customerId}`,
                title: `Customer ${customerId}`,
                icon: "user",
                metadata: {
                  ...context.defaultTab.metadata,
                  customerId,
                },
              };
            },
          }}
        >
          <MultiTabs />
          <Routes>
            <Route path="/customers/:id" element={<Page label="Customers" />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Customer 42" })).toBeTruthy();
    });

    expect(screen.getAllByRole("tab", { name: "Customer 42" })).toHaveLength(1);
    expect(
      JSON.parse(
        window.localStorage.getItem("test-tabs-custom-id-dedup") ?? "[]",
      ),
    ).toHaveLength(1);
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

  it("navigates and falls back correctly with BrowserRouter", async () => {
    window.history.replaceState({}, "", "/customers/42");

    render(<BrowserRouterShell />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Customer detail" })).toBeTruthy();
      expect(screen.getByTestId("page-label").textContent).toBe("Customers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Open reports" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/reports");
      expect(screen.getByTestId("page-label").textContent).toBe("Reports");
      expect(
        screen
          .getByRole("tab", { name: "Reports" })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });

    fireEvent.click(screen.getByLabelText("Close Reports"));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/customers/42");
      expect(screen.getByTestId("page-label").textContent).toBe("Customers");
      expect(
        screen
          .getByRole("tab", { name: "Customer detail" })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });
  });

  it("navigates when openTab targets the same pathname with a different search", async () => {
    window.history.replaceState({}, "", "/customers/42");

    render(<BrowserRouterSearchShell />);

    await waitFor(() => {
      expect(screen.getByTestId("current-location-search").textContent).toBe(
        "",
      );
      expect(screen.getByTestId("current-tab-title").textContent).toBe(
        "Customer detail",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Open timeline view" }));

    await waitFor(() => {
      expect(window.location.search).toBe("?view=timeline");
      expect(screen.getByTestId("current-location-search").textContent).toBe(
        "?view=timeline",
      );
      expect(screen.getByTestId("current-tab-title").textContent).toBe(
        "Customer timeline",
      );
    });

    expect(
      screen
        .getByRole("tab", { name: "Customer timeline" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });
});
