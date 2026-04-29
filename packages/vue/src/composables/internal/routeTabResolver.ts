import type { ComputedRef } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { MultiTabItem, UseMultiTabsOptions } from "../../types";
import { generateTabId, humanizeRouteName } from "./tabId";

export function buildDefaultTabFromRoute(
  route: RouteLocationNormalizedLoaded,
  tabs: MultiTabItem[],
  defaultIcon: string,
): MultiTabItem {
  const id = generateTabId(route);
  const existing = tabs.find((tab) => tab.id === id);

  let title = "";
  if (route.query["staffTitle"]) {
    title = String(route.query["staffTitle"]);
  } else if (route.query["caseNumber"]) {
    title = String(route.query["caseNumber"]);
  } else if (route.meta?.["title"]) {
    title = String(route.meta["title"]);
  } else if (route.name) {
    title = humanizeRouteName(String(route.name));
  } else {
    title = route.path;
  }

  if (!title && existing?.title) {
    title = existing.title;
  }

  return {
    id,
    title,
    icon: (route.meta?.["icon"] as string | undefined) ?? defaultIcon,
    to: {
      name: route.name ?? undefined,
      params: route.params,
      query: route.query,
    },
    isMenuItem: Boolean(route.meta?.["isMenuItem"]),
    routeName: route.name ? String(route.name) : null,
    caseNumber: route.query["caseNumber"]
      ? String(route.query["caseNumber"])
      : null,
    caseTitle: route.query["caseTitle"]
      ? String(route.query["caseTitle"])
      : null,
  };
}

export function resolveTabFromRoute(
  route: RouteLocationNormalizedLoaded,
  tabs: MultiTabItem[],
  defaultIcon: string,
  tabResolver: ComputedRef<NonNullable<UseMultiTabsOptions["resolveTab"]>>,
): MultiTabItem {
  const defaultTab = buildDefaultTabFromRoute(route, tabs, defaultIcon);
  const defaultExistingTab =
    tabs.find((tab) => tab.id === defaultTab.id) ?? null;

  const initialResolved =
    tabResolver.value(route, {
      existingTab: defaultExistingTab,
      defaultTab,
    }) ?? {};

  const resolvedId = initialResolved.id ?? defaultTab.id;
  const existingTab =
    resolvedId === defaultTab.id
      ? defaultExistingTab
      : (tabs.find((tab) => tab.id === resolvedId) ?? null);

  const resolved =
    existingTab === defaultExistingTab
      ? initialResolved
      : (tabResolver.value(route, {
          existingTab,
          defaultTab,
        }) ?? initialResolved);

  return {
    ...defaultTab,
    ...resolved,
    id: resolved.id ?? defaultTab.id,
    to: resolved.to ?? defaultTab.to,
    title: resolved.title ?? defaultTab.title,
    icon: resolved.icon ?? defaultTab.icon,
    isMenuItem: resolved.isMenuItem ?? defaultTab.isMenuItem,
  };
}
