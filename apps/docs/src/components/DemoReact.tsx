import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { MultiTabs, MultiTabsProvider } from "@drm/multitabs-react";
import "@drm/multitabs-react/styles";

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

const IconTab = () => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="currentColor"
    style={{ opacity: 0.5, flexShrink: 0 }}
  >
    <circle cx="4" cy="4" r="3" />
  </svg>
);

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
      <h2>Welcome</h2>
      <p>Navigate using the links below to open new tabs.</p>
      <nav className="demo-nav">
        <a href="#" onClick={openDemoRoute("/about")}>
          About
        </a>
        <a href="#" onClick={openDemoRoute("/reports")}>
          Reports
        </a>
        <a href="#" onClick={openDemoRoute("/settings")}>
          Settings
        </a>
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
        <MultiTabsProvider options={{ storageKey: "drm-multitabs-demo-react" }}>
          <MultiTabs
            theme={reactTheme}
            launcherIcon={<IconLauncher />}
            tabIcon={() => <IconTab />}
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
