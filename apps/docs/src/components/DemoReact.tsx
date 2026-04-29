import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { MultiTabs, MultiTabsProvider } from "@drobinetm/multitabs-react";
import "@drobinetm/multitabs-react/styles";

type IconKey = "home" | "info" | "report" | "settings";

type DemoRoute = {
  path: string;
  label: string;
  title: string;
  icon: IconKey;
};

const reactTheme = {
  shellBg: "rgba(97, 218, 251, 0.08)",
  tabBg: "rgba(255, 255, 255, 0.05)",
  tabColor: "#d8f7ff",
  activeTabBg: "#61dafb",
  activeTabColor: "#08131f",
  activeTabBorderColor: "#61dafb",
  closeHoverColor: "#61dafb",
  dragOverColor: "#61dafb",
} as const;

// ─── SVG icons (avoids Unicode glyph dependency on Rajdhani) ─────────────────

const IconLauncher = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconClose = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconDropdown = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconReload = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function IconHome() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 9.91 3H10a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const demoRoutes: DemoRoute[] = [
  { path: "/", label: "Home", title: "Home", icon: "home" },
  { path: "/about", label: "About", title: "About", icon: "info" },
  { path: "/reports", label: "Reports", title: "Reports", icon: "report" },
  { path: "/settings", label: "Settings", title: "Settings", icon: "settings" },
];

const routeByPath = new Map(demoRoutes.map((route) => [route.path, route]));

function renderTabIcon(icon: IconKey | string | null) {
  if (!icon) {
    return null;
  }

  switch (icon) {
    case "home":
      return <IconHome />;
    case "info":
      return <IconInfo />;
    case "report":
      return <IconReport />;
    case "settings":
      return <IconSettings />;
    default:
      return <IconInfo />;
  }
}

// ─── Page components ──────────────────────────────────────────────────────────

function HomePage() {
  const navigate = useNavigate();

  const openDemoRoute =
    (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(path);
    };

  return (
    <div className="demo-page">
      <h2>Home</h2>
      <p>Navigate using the links below to open new tabs.</p>
      <nav className="demo-nav">
        {demoRoutes
          .filter((route) => route.path !== "/")
          .map((route) => (
            <a key={route.path} href="#" onClick={openDemoRoute(route.path)}>
              {route.label}
            </a>
          ))}
      </nav>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="demo-page">
      <h2>About</h2>
      <p>Each route visit opens a new persistent tab in the workspace.</p>
      <p style={{ marginTop: "0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
        Right-click a tab for context menu options.
      </p>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="demo-page">
      <h2>Reports</h2>
      <p>This tab stays open while you navigate to other sections.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="demo-page">
      <h2>Settings</h2>
      <p>Tabs can be reordered by dragging.</p>
    </div>
  );
}

// ─── Island — MemoryRouter keeps navigation in memory, never touches the URL ──

export default function DemoReact() {
  return (
    <div
      className="demo-shell-wrapper"
      style={{
        width: "100%",
        minHeight: 420,
        background: "#0a1628",
        borderRadius: 12,
      }}
    >
      <MemoryRouter initialEntries={["/"]}>
        <MultiTabsProvider
          options={{
            storageKey: "drm-multitabs-demo-react",
            resolveTab: (location, context) => {
              const route = routeByPath.get(location.pathname);

              if (!route) {
                return undefined;
              }

              return {
                title: route.title,
                icon: route.icon,
                metadata: {
                  ...context.defaultTab.metadata,
                  demoLabel: route.label,
                },
              };
            },
          }}
        >
          <MultiTabs
            theme={reactTheme}
            launcherIcon={<IconLauncher />}
            tabIcon={(tab) => renderTabIcon(tab.icon)}
            closeIcon={<IconClose />}
            dropdownIcon={<IconDropdown />}
            menuIconReload={<IconReload />}
            menuIconClose={<IconClose />}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MultiTabsProvider>
      </MemoryRouter>
    </div>
  );
}
