import type { Matcher, ResolvedOptions } from './types';

export function extractPathname(requestUrl?: string): string | null {
  if (!requestUrl) {
    return null;
  }

  const queryIndex = requestUrl.indexOf('?');
  return queryIndex === -1 ? requestUrl : requestUrl.slice(0, queryIndex);
}

export function isNegotiablePath(pathname: string, options: ResolvedOptions): boolean {
  if (!pathname) {
    return false;
  }

  if (matchesAny(pathname, options.exclude)) {
    return false;
  }

  if (options.include.length > 0 && !matchesAny(pathname, options.include)) {
    return false;
  }

  if (options.excludePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  const lastSegment = pathname.split('/').pop() ?? '';
  const ext = extensionOf(lastSegment);
  if (ext && options.excludeExtensions.includes(ext)) {
    return false;
  }

  return !lastSegment.includes('.') || ext === '';
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  if (pathname.endsWith('/')) {
    return pathname;
  }

  const lastSegment = pathname.split('/').pop() ?? '';
  if (lastSegment.includes('.')) {
    return pathname;
  }

  return `${pathname}/`;
}

export function markdownAssetPath(pathname: string, markdownDir: string): string {
  const normalized = normalizePathname(pathname);

  if (normalized === '/') {
    return `/${markdownDir}/index.md`;
  }

  if (normalized.endsWith('/')) {
    return `/${markdownDir}${normalized}index.md`;
  }

  return `/${markdownDir}${normalized}.md`;
}

function extensionOf(value: string): string {
  const dotIndex = value.lastIndexOf('.');
  if (dotIndex === -1) {
    return '';
  }
  return value.slice(dotIndex).toLowerCase();
}

function matchesAny(pathname: string, matchers: Matcher[]): boolean {
  return matchers.some((matcher) => matches(pathname, matcher));
}

function matches(pathname: string, matcher: Matcher): boolean {
  if (typeof matcher === 'function') {
    return matcher(pathname);
  }

  if (matcher instanceof RegExp) {
    return matcher.test(pathname);
  }

  if (!matcher.includes('*')) {
    return pathname === matcher;
  }

  const regex = new RegExp(
    `^${matcher
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')}$`,
  );

  return regex.test(pathname);
}
