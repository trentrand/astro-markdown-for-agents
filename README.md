# astro-markdown-for-agents

Astro integration that generates markdown variants of your pages for AI agents and supports same-URL markdown negotiation in Astro dev.

## What it does

- Converts built HTML pages into markdown files under `dist/_markdown-cache` (configurable).
- In Astro dev, serves markdown when `Accept: text/markdown` (or `text/plain`, configurable) is preferred over HTML.
- Adds agent-oriented headers on markdown responses:
  - `Content-Type: text/markdown; charset=utf-8`
  - `Vary: Accept`
  - `x-markdown-tokens`
  - `content-signal`

## What it does NOT do

This package is deployment-agnostic. It does **not** include hosting-specific runtime shims.

For static hosting environments, serve-time negotiation should be implemented in the consumer app/runtime.

## Installation

```bash
bun add astro-markdown-for-agents
```

## Usage

In `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import markdownForAgents from 'astro-markdown-for-agents';

export default defineConfig({
  integrations: [
    markdownForAgents(),
  ],
});
```

## Quick verification (dev)

Start Astro dev, then compare responses for the same URL:

```bash
curl -i -H 'Accept: text/html' http://localhost:4321/
curl -i -H 'Accept: text/markdown' http://localhost:4321/
```

You should see HTML for `text/html` and markdown for `text/markdown`.

## Options

```ts
type Matcher = string | RegExp | ((pathname: string) => boolean);

type MarkdownForAgentsOptions = {
  include?: Matcher[];
  exclude?: Matcher[];
  excludePrefixes?: string[];
  excludeExtensions?: string[];
  markdownDir?: string;
  contentSignals?: {
    aiTrain?: boolean;
    search?: boolean;
    aiInput?: boolean;
  };
  maxExtractedChars?: number;
  preferPlainText?: boolean;
};
```

### Defaults

- `markdownDir`: `_markdown-cache`
- `preferPlainText`: `true`
- `maxExtractedChars`: `Infinity`
- `excludePrefixes`: `['/api/', '/_astro/']`
- `excludeExtensions`: common static assets (`.css`, `.js`, images, fonts, etc.)
- `contentSignals`: `ai-train=yes, search=yes, ai-input=yes`

## Export surfaces

- Root (`astro-markdown-for-agents`): integration entrypoint
- `astro-markdown-for-agents/core`: shared core helpers/types
- `astro-markdown-for-agents/runtime`: runtime-safe helpers for consumer-hosted negotiation shims

## Development notes

This package currently ships source files from `src/` via export maps for Astro/Vite-based consumption.

## License

MIT
