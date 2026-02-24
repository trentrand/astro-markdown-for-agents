type AcceptEntry = {
  mediaType: string;
  q: number;
  index: number;
};

export function parseAcceptHeader(value: string): AcceptEntry[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item, index) => {
      const [mediaType, ...params] = item
        .split(';')
        .map((part) => part.trim().toLowerCase());
      let q = 1;

      for (const param of params) {
        if (!param.startsWith('q=')) {
          continue;
        }
        const parsed = Number(param.slice(2));
        if (!Number.isNaN(parsed)) {
          q = parsed;
        }
      }

      return { mediaType, q, index };
    })
    .filter((entry) => entry.mediaType && entry.q > 0)
    .sort((a, b) => (b.q !== a.q ? b.q - a.q : a.index - b.index));
}

export function prefersMarkdown(acceptHeader: string, preferPlainText = true): boolean {
  const accepted = parseAcceptHeader(acceptHeader);
  if (accepted.length === 0) {
    return false;
  }

  const markdownIndex = accepted.findIndex((entry) =>
    entry.mediaType === 'text/markdown' || (preferPlainText && entry.mediaType === 'text/plain'),
  );

  if (markdownIndex === -1) {
    return false;
  }

  const htmlIndex = accepted.findIndex(
    (entry) =>
      entry.mediaType === 'text/html' || entry.mediaType === 'text/*' || entry.mediaType === '*/*',
  );

  return htmlIndex === -1 || markdownIndex < htmlIndex;
}
