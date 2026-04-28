import React, { useEffect, useState } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { MultiTabs, MultiTabsProvider } from "@drobinetm/multitabs-react";
import "@drobinetm/multitabs-react/styles";
import {
  formatSandboxCode,
  normalizeCodeBlock,
} from "../utils/formatSandboxCode";

type DemoRoute = {
  path: string;
  label: string;
  title?: string;
  body: string;
};

type SandboxDefinition = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  renderPreview: () => React.ReactNode;
};

const baseTheme = {
  shellBg: "rgba(97, 218, 251, 0.08)",
  tabBg: "rgba(255, 255, 255, 0.05)",
  tabColor: "#d8f7ff",
  activeTabBg: "#61dafb",
  activeTabColor: "#08131f",
  activeTabBorderColor: "#61dafb",
  closeHoverColor: "#61dafb",
  dragOverColor: "#61dafb",
} as const;

const customTheme = {
  shellBg: "rgba(14, 165, 233, 0.12)",
  tabBg: "rgba(30, 41, 59, 0.92)",
  tabColor: "#dbeafe",
  activeTabBg: "#38bdf8",
  activeTabColor: "#082f49",
  activeTabBorderColor: "#7dd3fc",
  closeHoverColor: "#38bdf8",
  dragOverColor: "#38bdf8",
  borderRadius: "18px",
} as const;

const overflowRoutes: DemoRoute[] = [
  {
    path: "/inbox",
    label: "Inbox",
    body: "Short route to start the tab rail.",
  },
  {
    path: "/calendar",
    label: "Calendar",
    body: "Opens another persistent tab.",
  },
  {
    path: "/analytics",
    label: "Analytics",
    body: "Keeps growing the workspace.",
  },
  {
    path: "/customers",
    label: "Customers",
    body: "Useful for overflow and dropdown review.",
  },
  {
    path: "/billing",
    label: "Billing",
    body: "Continue opening tabs to test the rail.",
  },
  {
    path: "/security",
    label: "Security",
    body: "The dropdown stays usable with many tabs.",
  },
];

const maxTabsRoutes: DemoRoute[] = [
  { path: "/alpha", label: "Alpha", body: "Tab one of the limited workspace." },
  { path: "/beta", label: "Beta", body: "Tab two of the limited workspace." },
  {
    path: "/gamma",
    label: "Gamma",
    body: "Tab three fills the configured limit.",
  },
  {
    path: "/delta",
    label: "Delta",
    body: "Opening this removes the oldest non-active tab.",
  },
];

const longTitleRoutes: DemoRoute[] = [
  {
    path: "/accounts/enterprise-east-region",
    label: "Enterprise account",
    title: "Enterprise account review for East Region and cross-team approvals",
    body: "Long titles should truncate cleanly without breaking layout.",
  },
  {
    path: "/claims/pending-medical-exceptions",
    label: "Pending claims",
    title: "Pending medical exceptions queue with manual reviewer escalation",
    body: "This state highlights max-width handling and tooltips.",
  },
  {
    path: "/audit/monthly-compliance-summary",
    label: "Audit summary",
    title:
      "Monthly compliance summary with unresolved deviations and note history",
    body: "Useful to review clipping, hover title, and dropdown readability.",
  },
];

const resolverRoutes: DemoRoute[] = [
  {
    path: "/orders/1001",
    label: "Order 1001",
    title: "Order detail",
    body: "The resolver maps params to richer record labels.",
  },
  {
    path: "/orders/1002",
    label: "Order 1002",
    title: "Order detail",
    body: "Each order opens its own tab because route params differ.",
  },
  {
    path: "/orders/1003",
    label: "Order 1003",
    title: "Order detail",
    body: "This sandbox isolates resolveTab logic for QA review.",
  },
];

const slotsRoutes: DemoRoute[] = [
  {
    path: "/workspace",
    label: "Workspace",
    body: "Custom slots let teams replace the neutral default icons.",
  },
  {
    path: "/operations",
    label: "Operations",
    body: "Theme tokens stay scoped to this instance only.",
  },
  {
    path: "/approvals",
    label: "Approvals",
    body: "Good for design review without affecting the standard demo.",
  },
];

function SquareIcon({ label }: { label: string }) {
  return (
    <span className="react-sandbox-icon" aria-hidden="true">
      {label}
    </span>
  );
}

function SandboxTabIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || icon === "circle") {
    return null;
  }

  const labelMap: Record<string, string> = {
    receipt: "RC",
    user: "US",
    report: "RP",
  };

  return (
    <SquareIcon label={labelMap[icon] ?? icon.slice(0, 2).toUpperCase()} />
  );
}

function SandboxToolbar({ routes }: { routes: DemoRoute[] }) {
  const navigate = useNavigate();

  return (
    <div className="react-sandbox-toolbar">
      {routes.map((route) => (
        <button
          key={route.path}
          type="button"
          className="react-sandbox-link"
          onClick={() => navigate(route.path)}
        >
          {route.label}
        </button>
      ))}
    </div>
  );
}

function SandboxStatus({ note }: { note: string }) {
  const location = useLocation();
  const activeRoute =
    overflowRoutes.find((route) => route.path === location.pathname) ??
    maxTabsRoutes.find((route) => route.path === location.pathname) ??
    longTitleRoutes.find((route) => route.path === location.pathname) ??
    resolverRoutes.find((route) => route.path === location.pathname) ??
    slotsRoutes.find((route) => route.path === location.pathname);

  return (
    <div className="react-sandbox-status">
      <span>{note}</span>
      <span>Route: {location.pathname}</span>
      <span>
        Active: {activeRoute?.title ?? activeRoute?.label ?? location.pathname}
      </span>
    </div>
  );
}

function RouteContent({ routes, note }: { routes: DemoRoute[]; note: string }) {
  const location = useLocation();
  const match = routes.find((route) => location.pathname === route.path);

  return (
    <div className="react-sandbox-body">
      <SandboxStatus note={note} />
      <SandboxToolbar routes={routes} />
      <div className="react-sandbox-panel">
        <h3>{match?.title ?? match?.label ?? "Open a route"}</h3>
        <p>
          {match?.body ??
            "Use the buttons above to open tabs inside this sandbox."}
        </p>
      </div>
    </div>
  );
}

function OverflowSandbox() {
  return (
    <div className="react-sandbox-instance">
      <MemoryRouter initialEntries={[overflowRoutes[0]!.path]}>
        <MultiTabsProvider
          options={{ storageKey: "drm-docs-react-overflow", defaultIcon: "" }}
        >
          <MultiTabs
            theme={baseTheme}
            tabIcon={(tab) => <SandboxTabIcon icon={tab.icon} />}
          />
          <Routes>
            {overflowRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteContent
                    routes={overflowRoutes}
                    note="Open all routes to force tab overflow and review the dropdown menu."
                  />
                }
              />
            ))}
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}

function MaxTabsSandbox() {
  return (
    <div className="react-sandbox-instance">
      <MemoryRouter initialEntries={[maxTabsRoutes[0]!.path]}>
        <MultiTabsProvider
          options={{
            storageKey: "drm-docs-react-max-tabs",
            maxTabs: 3,
            defaultIcon: "",
          }}
        >
          <MultiTabs
            theme={baseTheme}
            tabIcon={(tab) => <SandboxTabIcon icon={tab.icon} />}
          />
          <Routes>
            {maxTabsRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteContent
                    routes={maxTabsRoutes}
                    note="This sandbox is capped at three tabs. Opening Delta removes the oldest non-active tab."
                  />
                }
              />
            ))}
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}

function LongTitlesSandbox() {
  return (
    <div className="react-sandbox-instance">
      <MemoryRouter initialEntries={[longTitleRoutes[0]!.path]}>
        <MultiTabsProvider
          options={{
            storageKey: "drm-docs-react-long-titles",
            defaultIcon: "",
            resolveTitle: (pathname) =>
              longTitleRoutes.find((route) => route.path === pathname)?.title ??
              null,
          }}
        >
          <MultiTabs
            theme={baseTheme}
            tabIcon={(tab) => <SandboxTabIcon icon={tab.icon} />}
          />
          <Routes>
            {longTitleRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteContent
                    routes={longTitleRoutes}
                    note="Use this state to review truncation, hover titles, and dropdown readability."
                  />
                }
              />
            ))}
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}

function ResolveTabSandbox() {
  return (
    <div className="react-sandbox-instance">
      <MemoryRouter initialEntries={[resolverRoutes[0]!.path]}>
        <MultiTabsProvider
          options={{
            storageKey: "drm-docs-react-resolve-tab",
            defaultIcon: "receipt",
            resolveTitle: (pathname) => {
              if (!pathname.startsWith("/orders/")) return null;
              const orderId = pathname.split("/").pop();
              return `Order ${orderId} workspace`;
            },
          }}
        >
          <MultiTabs
            theme={baseTheme}
            tabIcon={(tab) => <SandboxTabIcon icon={tab.icon} />}
          />
          <Routes>
            {resolverRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteContent
                    routes={resolverRoutes}
                    note="This sandbox isolates resolveTab behavior with route params mapped to richer workspace labels."
                  />
                }
              />
            ))}
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}

function CustomSlotsSandbox() {
  return (
    <div className="react-sandbox-instance">
      <MemoryRouter initialEntries={[slotsRoutes[0]!.path]}>
        <MultiTabsProvider
          options={{ storageKey: "drm-docs-react-slots-theme" }}
        >
          <MultiTabs
            className="react-sandbox-tabs--slots"
            theme={customTheme}
            launcherIcon={<SquareIcon label="AP" />}
            tabIcon={() => <SquareIcon label="T" />}
            closeIcon={<SquareIcon label="X" />}
            dropdownIcon={<SquareIcon label="M" />}
            menuIconReload={<SquareIcon label="R" />}
            menuIconClose={<SquareIcon label="C" />}
          />
          <Routes>
            {slotsRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteContent
                    routes={slotsRoutes}
                    note="This sandbox isolates custom slots and scoped theme tokens for visual review."
                  />
                }
              />
            ))}
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}

const sandboxes: SandboxDefinition[] = [
  {
    id: "overflow",
    eyebrow: "Overflow",
    title: "Many open tabs",
    description:
      "Use this isolated shell to test horizontal overflow, dropdown behavior, and drag targets with several open routes.",
    code: normalizeCodeBlock(
      `<MultiTabsProvider\n+  options={{ storageKey: "drm-docs-react-overflow" }}\n+>\n+  <MultiTabs theme={baseTheme} />\n+</MultiTabsProvider>`,
    ),
    renderPreview: () => <OverflowSandbox />,
  },
  {
    id: "limit",
    eyebrow: "Limit",
    title: "Maximum tab cap",
    description:
      "Opens routes inside a workspace capped at three tabs so teams can validate removal behavior before shipping.",
    code: normalizeCodeBlock(
      `<MultiTabsProvider\n+  options={{ storageKey: "drm-docs-react-max-tabs", maxTabs: 3 }}\n+>\n+  <MultiTabs theme={baseTheme} />\n+</MultiTabsProvider>`,
    ),
    renderPreview: () => <MaxTabsSandbox />,
  },
  {
    id: "labels",
    eyebrow: "Labels",
    title: "Very long titles",
    description:
      "Focuses on truncation, hover titles, and dropdown readability for back-office records with long human labels.",
    code: normalizeCodeBlock(
      `<MultiTabsProvider\n+  options={{\n+    storageKey: "drm-docs-react-long-titles",\n+    resolveTitle: (pathname) => resolveLongTitle(pathname),\n+  }}\n+>\n+  <MultiTabs theme={baseTheme} />\n+</MultiTabsProvider>`,
    ),
    renderPreview: () => <LongTitlesSandbox />,
  },
  {
    id: "resolver",
    eyebrow: "Resolver",
    title: "Dynamic route mapping",
    description:
      "Demonstrates route params mapped to richer workspace labels through a title resolver.",
    code: normalizeCodeBlock(
      `const resolveTitle = (pathname) =>\n+  pathname.startsWith("/orders/")\n+    ? \`Order ${"${pathname.split('/').pop()}"} workspace\`\n+    : null\n+\n+<MultiTabsProvider\n+  options={{ defaultIcon: "receipt", resolveTitle }}\n+>\n+  <MultiTabs theme={baseTheme} />\n+</MultiTabsProvider>`,
    ),
    renderPreview: () => <ResolveTabSandbox />,
  },
  {
    id: "slots",
    eyebrow: "Slots",
    title: "Custom icons and theme",
    description:
      "Shows the six visual slot props and component-scoped theme tokens without affecting the default React demo.",
    code: normalizeCodeBlock(
      `<MultiTabs\n+  theme={customTheme}\n+  launcherIcon={<span>AP</span>}\n+  tabIcon={() => <span>T</span>}\n+  closeIcon={<span>X</span>}\n+  dropdownIcon={<span>M</span>}\n+/>`,
    ),
    renderPreview: () => <CustomSlotsSandbox />,
  },
];

function SandboxCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied && !failed) return undefined;

    const timeout = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [copied, failed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setFailed(false);
      setCopied(true);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  };

  return (
    <button
      type="button"
      className="code-copy-button react-sandbox-copy-button"
      data-copied={copied ? "true" : "false"}
      data-tooltip={failed ? "Copy failed" : copied ? "Copied" : ""}
      aria-label={failed ? "Copy failed" : copied ? "Code copied" : "Copy code"}
      onClick={handleCopy}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SandboxCard({ sandbox }: { sandbox: SandboxDefinition }) {
  return (
    <section className="react-sandbox-card">
      <div className="react-sandbox-card__preview">
        <header className="react-sandbox-card__header">
          <div className="react-sandbox-card__eyebrow">{sandbox.eyebrow}</div>
          <h2>{sandbox.title}</h2>
          <p>{sandbox.description}</p>
        </header>
        {sandbox.renderPreview()}
      </div>

      <div className="react-sandbox-card__code">
        <div className="react-sandbox-card__code-header">
          <span>Example code</span>
          <SandboxCopyButton code={sandbox.code} />
        </div>
        <pre className="react-sandbox-pre">
          <code
            dangerouslySetInnerHTML={{
              __html: formatSandboxCode(sandbox.code),
            }}
          />
        </pre>
      </div>
    </section>
  );
}

export default function ReactEdgeCaseSandboxes() {
  return (
    <>
      <div className="react-sandbox-stack">
        {sandboxes.map((sandbox) => (
          <SandboxCard key={sandbox.id} sandbox={sandbox} />
        ))}
      </div>

      <style>{`
        .react-sandbox-stack {
          display: grid;
          gap: 1rem;
        }

        .react-sandbox-card {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
          gap: 1rem;
          align-items: stretch;
          background: linear-gradient(180deg, rgba(10, 18, 34, 0.78), rgba(6, 12, 24, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1rem;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
        }

        .react-sandbox-card__preview,
        .react-sandbox-card__code {
          min-width: 0;
        }

        .react-sandbox-card__header {
          margin-bottom: 0.9rem;
        }

        .react-sandbox-card__eyebrow {
          color: #61dafb;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 700;
          margin-bottom: 0.55rem;
        }

        .react-sandbox-card__header h2 {
          margin: 0;
          font-size: 1.35rem;
          color: #f8fafc;
        }

        .react-sandbox-card__header p {
          margin: 0.45rem 0 0;
          color: #94a3b8;
          line-height: 1.55;
        }

        .react-sandbox-instance {
          width: 100%;
          min-height: 340px;
          border-radius: 14px;
          overflow: hidden;
          background: #0a1628;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .react-sandbox-instance .drm-multitabs {
          font-family: system-ui, sans-serif;
          border-radius: 14px 14px 0 0;
        }

        .react-sandbox-instance .drm-multitabs__menu-card {
          z-index: 200;
        }

        .react-sandbox-card__code {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          background: rgba(7, 14, 28, 0.82);
          border: 1px solid rgba(96, 160, 255, 0.16);
          overflow: hidden;
        }

        .react-sandbox-card__code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 3rem;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #dbeafe;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .react-sandbox-copy-button {
          position: static;
          min-width: auto;
          height: 2rem;
          padding: 0 0.8rem;
        }

        .react-sandbox-pre {
          position: relative;
          margin: 0;
          flex: 1;
          overflow: auto;
          padding: 1rem;
          background: transparent;
        }

        .react-sandbox-pre code {
          display: block;
          width: max-content;
          min-width: 100%;
          white-space: pre;
          font-size: 0.84rem;
          line-height: 1.7;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        }

        .react-sandbox-pre .sandbox-code__tag {
          color: #7dd3fc;
        }

        .react-sandbox-pre .sandbox-code__attr {
          color: #f9a8d4;
        }

        .react-sandbox-pre .sandbox-code__string {
          color: #86efac;
        }

        .react-sandbox-pre .sandbox-code__keyword {
          color: #c084fc;
          font-weight: 700;
        }

        .react-sandbox-pre .sandbox-code__punct {
          color: #cbd5e1;
        }

        .react-sandbox-tabs--slots .drm-multitabs__tab[title="Workspace"].drm-multitabs__tab--active {
          background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
          color: #082f49;
          border-top-color: #7dd3fc;
          box-shadow: 0 10px 22px rgba(14, 165, 233, 0.18);
        }

        .react-sandbox-tabs--slots .drm-multitabs__tab[title="Workspace"].drm-multitabs__tab--active:hover {
          background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
          color: #082f49;
        }

        .react-sandbox-body {
          min-height: 274px;
          padding: 1rem;
          color: #e2e8f0;
          background: linear-gradient(180deg, rgba(7, 14, 28, 0.9), rgba(10, 22, 40, 1));
        }

        .react-sandbox-status {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
          font-size: 0.76rem;
          color: #93c5fd;
        }

        .react-sandbox-status span {
          padding: 0.28rem 0.55rem;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }

        .react-sandbox-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-bottom: 0.9rem;
        }

        .react-sandbox-link {
          appearance: none;
          border: 0;
          cursor: pointer;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: linear-gradient(180deg, #61dafb 0%, #2d90c5 100%);
          color: #07131d;
          font-weight: 700;
          font-size: 0.82rem;
        }

        .react-sandbox-link:hover {
          opacity: 0.88;
        }

        .react-sandbox-panel {
          border-radius: 14px;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.66);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .react-sandbox-panel h3 {
          margin: 0 0 0.55rem;
          font-size: 1.05rem;
          color: #f8fafc;
        }

        .react-sandbox-panel p {
          margin: 0;
          line-height: 1.6;
          color: #94a3b8;
        }

        .react-sandbox-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.25rem;
          height: 1.25rem;
          padding: 0 0.2rem;
          border-radius: 0.4rem;
          font-size: 0.65rem;
          font-weight: 800;
          line-height: 1;
          color: inherit;
          background: rgba(15, 23, 42, 0.18);
          border: 1px solid currentColor;
        }

        .react-sandbox-tabs--slots .drm-multitabs__close .react-sandbox-icon {
          min-width: 1rem;
          height: 1rem;
          font-size: 0.55rem;
          border-radius: 0.32rem;
        }

        @media (max-width: 1080px) {
          .react-sandbox-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
