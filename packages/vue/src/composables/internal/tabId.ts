import type { RouteLocationNormalizedLoaded } from "vue-router";

function serializeParams(params: Record<string, string | string[]>): string {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key}:"${Array.isArray(value) ? value.join(",") : value}"`,
    )
    .join("|");
}

export function generateTabId(route: RouteLocationNormalizedLoaded): string {
  const name = route.name ? String(route.name) : null;
  const params = route.params as Record<string, string | string[]>;

  if (name) {
    const serialized = serializeParams(params);
    return serialized ? `${name}::${serialized}` : name;
  }

  return route.path;
}

export function humanizeRouteName(name: string | null | undefined): string {
  if (!name) return "Page";

  return String(name)
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}
