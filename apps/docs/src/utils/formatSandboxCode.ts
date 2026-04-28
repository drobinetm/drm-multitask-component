function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function withPlaceholders(input: string, pattern: RegExp, className: string) {
  const tokens: string[] = [];

  const text = input.replace(pattern, (match) => {
    const placeholder = `__TOKEN_${tokens.length}__`;
    tokens.push(`<span class="${className}">${match}</span>`);
    return placeholder;
  });

  return { text, tokens };
}

function restorePlaceholders(input: string, tokens: string[]) {
  return input.replace(
    /__TOKEN_(\d+)__/g,
    (_, index) => tokens[Number(index)] ?? "",
  );
}

function createPlaceholderStore() {
  const tokens: string[] = [];

  return {
    wrap(value: string, className: string) {
      const placeholder = `__TOKEN_${tokens.length}__`;
      tokens.push(`<span class="${className}">${value}</span>`);
      return placeholder;
    },
    restore(input: string) {
      return restorePlaceholders(input, tokens);
    },
  };
}

export function normalizeCodeBlock(input: string) {
  return input.replace(/\n\+/g, "\n");
}

export function formatSandboxCode(input: string) {
  const escaped = escapeHtml(normalizeCodeBlock(input));
  const store = createPlaceholderStore();

  const stringResult = withPlaceholders(
    escaped,
    /`[^`]*`|"[^"]*"|'[^']*'/g,
    "sandbox-code__string",
  );

  let highlighted = stringResult.text
    .replace(/(&lt;\/?)([A-Za-z][\w.-]*)/g, (_, open, name) => {
      return `${open}${store.wrap(name, "sandbox-code__tag")}`;
    })
    .replace(/(\s)([:@#]?[A-Za-z_][\w-]*)(=)/g, (_, space, attr, eq) => {
      return `${space}${store.wrap(attr, "sandbox-code__attr")}${store.wrap(eq, "sandbox-code__punct")}`;
    })
    .replace(/\b(const|return)\b/g, (keyword) => {
      return store.wrap(keyword, "sandbox-code__keyword");
    })
    .replace(
      /(\{\{|\}\}|\{|\}|\(|\)|\[|\]|&lt;|&gt;|\/&gt;|\/>)/g,
      (punctuation) => {
        return store.wrap(punctuation, "sandbox-code__punct");
      },
    );

  highlighted = store.restore(highlighted);
  highlighted = restorePlaceholders(highlighted, stringResult.tokens);

  return highlighted;
}
