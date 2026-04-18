import { Injectable, inject, InjectionToken } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import type { MultiTabItem, MultiTabsOptions } from "../types";
import { TabReloadService } from "./tab-reload.service";

export const MULTI_TABS_OPTIONS = new InjectionToken<MultiTabsOptions>(
  "MULTI_TABS_OPTIONS",
);

const DEFAULT_OPTIONS: Required<MultiTabsOptions> = {
  storageKey: "drm-multitabs",
  defaultIcon: "circle",
  maxTabs: Infinity,
};

function humanizePathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "Home";
  return last
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .trim();
}

function generateTabId(url: string): string {
  // Use the pathname part only (before ?)
  return url.split("?")[0] ?? url;
}

function readStoredTabs(storageKey: string): MultiTabItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MultiTabItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTabs(storageKey: string, tabs: MultiTabItem[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tabs));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Core service for the MultiTabs system.
 *
 * Provide at root or at a specific component level:
 *
 * @example
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     MultiTabsService,
 *     { provide: MULTI_TABS_OPTIONS, useValue: { storageKey: 'my-tabs' } }
 *   ]
 * }
 */
@Injectable({ providedIn: "root" })
export class MultiTabsService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tabReload = inject(TabReloadService);
  private readonly options: Required<MultiTabsOptions>;

  readonly tabs$ = new BehaviorSubject<MultiTabItem[]>([]);

  get tabs(): MultiTabItem[] {
    return this.tabs$.value;
  }

  get currentTabId(): string {
    return generateTabId(this.router.url);
  }

  get currentTab(): MultiTabItem | null {
    return this.tabs.find((t) => t.id === this.currentTabId) ?? null;
  }

  constructor() {
    // Try to inject options; use defaults if not provided
    let injectedOptions: MultiTabsOptions = {};
    try {
      injectedOptions = inject(MULTI_TABS_OPTIONS);
    } catch {
      // options not provided — use defaults
    }
    this.options = { ...DEFAULT_OPTIONS, ...injectedOptions };

    // Load persisted tabs
    this.tabs$.next(readStoredTabs(this.options.storageKey));

    // Subscribe to router navigation events
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncCurrentTab());

    // Sync on init in case the route is already active
    this.syncCurrentTab();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private setTabs(tabs: MultiTabItem[]): void {
    this.tabs$.next(tabs);
    writeStoredTabs(this.options.storageKey, tabs);
  }

  private syncCurrentTab(): void {
    const url = this.router.url;
    const id = generateTabId(url);
    const snapshot = this.route.snapshot;

    // Resolve title
    let title =
      snapshot.queryParams["staffTitle"] ??
      snapshot.queryParams["caseNumber"] ??
      snapshot.data?.["title"] ??
      humanizePathname(url.split("?")[0] ?? url);

    // Preserve previous title if new URL lost it
    const existing = this.tabs.find((t) => t.id === id);
    if (!title && existing?.title) title = existing.title;

    const resolved: MultiTabItem = {
      id,
      title,
      icon: this.options.defaultIcon,
      to: [url.split("?")[0] ?? url],
      isMenuItem: false,
      routePath: url.split("?")[0] ?? url,
      caseNumber: snapshot.queryParams["caseNumber"] ?? null,
      caseTitle: snapshot.queryParams["caseTitle"] ?? null,
    };

    const current = [...this.tabs];
    const index = current.findIndex((t) => t.id === id);

    if (index === -1) {
      if (
        this.options.maxTabs !== Infinity &&
        current.length >= this.options.maxTabs
      ) {
        const removeIdx = current.findIndex((t) => t.id !== id);
        if (removeIdx !== -1) current.splice(removeIdx, 1);
      }
      this.setTabs([...current, resolved]);
    } else {
      current[index] = { ...current[index]!, ...resolved };
      this.setTabs(current);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  openTab(tab: MultiTabItem): void {
    if (tab.id === this.currentTabId) return;
    this.router.navigateByUrl(
      Array.isArray(tab.to) ? tab.to[0] : String(tab.to),
    );
  }

  closeTab(tab: MultiTabItem): void {
    if (this.tabs.length <= 1) return;
    const index = this.tabs.findIndex((t) => t.id === tab.id);
    if (index === -1) return;

    const next = this.tabs.filter((t) => t.id !== tab.id);

    if (tab.id === this.currentTabId) {
      const nextTab = next[index] ?? next[index - 1] ?? next[0];
      if (nextTab)
        this.router.navigateByUrl(
          Array.isArray(nextTab.to) ? nextTab.to[0] : String(nextTab.to),
        );
    }

    this.setTabs(next);
  }

  closeAllTabs(): void {
    const active = this.currentTab;
    if (!active) return;
    this.setTabs([active]);
  }

  moveTab(sourceId: string, targetId: string): void {
    if (sourceId === targetId) return;
    const next = [...this.tabs];
    const si = next.findIndex((t) => t.id === sourceId);
    const ti = next.findIndex((t) => t.id === targetId);
    if (si === -1 || ti === -1) return;
    const [moved] = next.splice(si, 1);
    if (moved) next.splice(ti, 0, moved);
    this.setTabs(next);
  }

  reloadTab(tab: MultiTabItem): void {
    this.tabReload.bump(tab.id);
    if (tab.id !== this.currentTabId) {
      this.openTab(tab);
    }
  }
}
