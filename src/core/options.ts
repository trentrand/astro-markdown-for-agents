import type { MarkdownForAgentsOptions, ResolvedOptions } from './types';

const DEFAULT_EXCLUDE_PREFIXES = ['/api/', '/_astro/'];
const DEFAULT_EXCLUDE_EXTENSIONS = [
  '.css',
  '.js',
  '.mjs',
  '.map',
  '.json',
  '.xml',
  '.txt',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.pdf',
  '.zip',
  '.woff',
  '.woff2',
];

export function resolveOptions(options: MarkdownForAgentsOptions = {}): ResolvedOptions {
  return {
    include: options.include ?? [],
    exclude: options.exclude ?? [],
    excludePrefixes: options.excludePrefixes ?? DEFAULT_EXCLUDE_PREFIXES,
    excludeExtensions: options.excludeExtensions ?? DEFAULT_EXCLUDE_EXTENSIONS,
    markdownDir: options.markdownDir ?? '_markdown-cache',
    contentSignalHeader: toContentSignalHeader(options.contentSignals),
    maxExtractedChars: options.maxExtractedChars ?? Infinity,
    preferPlainText: options.preferPlainText ?? true,
  };
}

function toContentSignalHeader(signals: MarkdownForAgentsOptions['contentSignals']): string {
  const resolved = {
    aiTrain: signals?.aiTrain ?? true,
    search: signals?.search ?? true,
    aiInput: signals?.aiInput ?? true,
  };

  return [
    `ai-train=${resolved.aiTrain ? 'yes' : 'no'}`,
    `search=${resolved.search ? 'yes' : 'no'}`,
    `ai-input=${resolved.aiInput ? 'yes' : 'no'}`,
  ].join(', ');
}
