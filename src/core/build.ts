import fs from 'node:fs/promises';
import path from 'node:path';
import { htmlToMarkdown } from './convert';
import { isNegotiablePath, markdownAssetPath } from './routes';
import type { ResolvedOptions } from './types';

type GenerateMarkdownAssetsInput = {
  distDir: string;
  options: ResolvedOptions;
};

export async function generateMarkdownAssets(input: GenerateMarkdownAssetsInput): Promise<void> {
  const htmlFiles = await collectHtmlFiles(input.distDir, input.options.markdownDir);

  for (const htmlFilePath of htmlFiles) {
    const relativeHtmlPath = path.relative(input.distDir, htmlFilePath);
    const pathname = htmlFileToRoutePath(relativeHtmlPath);
    if (!isNegotiablePath(pathname, input.options)) {
      continue;
    }

    const html = await fs.readFile(htmlFilePath, 'utf-8');
    const markdown = htmlToMarkdown(html, pathname, input.options.maxExtractedChars);
    const outPath = path.join(
      input.distDir,
      markdownAssetPath(pathname, input.options.markdownDir).slice(1),
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, markdown, 'utf-8');
  }
}

async function collectHtmlFiles(distDir: string, markdownDir: string): Promise<string[]> {
  const entries = await fs.readdir(distDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(distDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '_worker.js' || entry.name === markdownDir) {
        continue;
      }

      files.push(...(await collectHtmlFiles(absolutePath, markdownDir)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function htmlFileToRoutePath(relativeHtmlPath: string): string {
  const normalized = relativeHtmlPath.split(path.sep).join('/');

  if (normalized === 'index.html') {
    return '/';
  }

  if (normalized.endsWith('/index.html')) {
    return `/${normalized.slice(0, -'/index.html'.length)}/`;
  }

  if (normalized.endsWith('.html')) {
    return `/${normalized.slice(0, -'.html'.length)}`;
  }

  return '/';
}
