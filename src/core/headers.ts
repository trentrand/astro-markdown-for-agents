import type { ResolvedOptions } from './types';

export function ensureVaryAccept(headers: Headers): void {
  const vary = headers.get('vary');
  if (!vary) {
    headers.set('vary', 'Accept');
    return;
  }

  const values = vary
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (!values.includes('accept')) {
    headers.set(
      'vary',
      [...new Set([...vary.split(',').map((part) => part.trim()), 'Accept'])]
        .filter(Boolean)
        .join(', '),
    );
  }
}

export function isHtmlResponse(contentType: string | null): boolean {
  return (contentType ?? '').toLowerCase().includes('text/html');
}

export function countTokens(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}

export function applyMarkdownHeaders(
  headers: Headers,
  markdown: string,
  options: Pick<ResolvedOptions, 'contentSignalHeader'>,
): void {
  headers.set('content-type', 'text/markdown; charset=utf-8');
  headers.set('x-markdown-tokens', String(countTokens(markdown)));
  headers.set('content-signal', options.contentSignalHeader);
  headers.delete('content-length');
  headers.delete('etag');
}
