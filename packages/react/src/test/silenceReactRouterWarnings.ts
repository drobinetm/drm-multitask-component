import { afterAll, beforeAll, vi } from "vitest";

const REACT_ROUTER_WARNING_PATTERNS = [
  "React Router Future Flag Warning:",
  "v7_startTransition",
  "v7_relativeSplatPath",
];

function isReactRouterFutureWarning(message: unknown): boolean {
  if (typeof message !== "string") {
    return false;
  }

  return REACT_ROUTER_WARNING_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

export function silenceReactRouterFutureWarnings() {
  let restoreWarn: (() => void) | null = null;

  beforeAll(() => {
    const originalWarn = console.warn;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation((...args) => {
      if (args.some((arg) => isReactRouterFutureWarning(arg))) {
        return;
      }

      originalWarn(...args);
    });

    restoreWarn = () => warnSpy.mockRestore();
  });

  afterAll(() => {
    restoreWarn?.();
  });
}
