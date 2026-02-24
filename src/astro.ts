import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import {
  applyMarkdownHeaders,
  extractPathname,
  generateMarkdownAssets,
  htmlToMarkdown,
  isHtmlResponse,
  isNegotiablePath,
  resolveOptions,
  ensureVaryAccept,
  shouldHandleDevRequest,
  type MarkdownForAgentsOptions,
  writeNodeResponse,
} from './core/index';
const DEV_BYPASS_HEADER = 'x-markdown-negotiation-bypass';

export default function markdownForAgents(options: MarkdownForAgentsOptions = {}): AstroIntegration {
  const resolved = resolveOptions(options);

  return {
    name: 'markdown-for-agents',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (!shouldHandleDevRequest(req, resolved.preferPlainText, DEV_BYPASS_HEADER)) {
            next();
            return;
          }

          const host = req.headers.host;
          const pathname = extractPathname(req.url);

          if (!host || !pathname || !isNegotiablePath(pathname, resolved)) {
            next();
            return;
          }

          try {
            const method = (req.method ?? 'GET').toUpperCase();
            const requestUrl = new URL(req.url ?? '/', `http://${host}`);
            const htmlResponse = await fetch(requestUrl.toString(), {
              method,
              headers: {
                accept: 'text/html',
                [DEV_BYPASS_HEADER]: '1',
              },
            });

            const headers = new Headers(htmlResponse.headers);
            ensureVaryAccept(headers);

            if (!htmlResponse.ok || !isHtmlResponse(headers.get('content-type'))) {
              await writeNodeResponse(res, htmlResponse, headers);
              return;
            }

            const html = await htmlResponse.text();
            const markdown = htmlToMarkdown(html, pathname, resolved.maxExtractedChars);
            applyMarkdownHeaders(headers, markdown, resolved);

            res.statusCode = htmlResponse.status;
            res.statusMessage = htmlResponse.statusText;

            for (const [key, value] of headers.entries()) {
              res.setHeader(key, value);
            }

            if (method === 'HEAD') {
              res.end();
              return;
            }

            res.end(markdown);
          } catch (error) {
            next(error as Error);
          }
        });
      },

      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        await generateMarkdownAssets({ distDir, options: resolved });
        logger.info('[markdown-for-agents] Markdown assets generated');
      },
    },
  };
}
