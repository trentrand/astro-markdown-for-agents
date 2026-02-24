import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export function htmlToMarkdown(
  html: string,
  routePath: string,
  maxExtractedChars: number,
): string {
  const title = extractMeta(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = extractMeta(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i,
  );

  const bodyHtml = extractBodyHtml(html);
  const markdown = turndown.turndown(bodyHtml).trim().slice(0, maxExtractedChars).trim();

  const lines: string[] = [
    `# ${title || `Page ${routePath}`}`,
    '',
    `- Path: ${routePath}`,
    `- Generated: ${new Date().toISOString()}`,
  ];

  if (description) {
    lines.push(`- Description: ${description}`);
  }

  lines.push('', '## Extracted Content', '', markdown || '_No extractable body content found._');

  return lines.join('\n');
}

function extractBodyHtml(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  return stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? stripped;
}

function extractMeta(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return decodeHtmlEntities(match?.[1]?.trim() ?? '');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
