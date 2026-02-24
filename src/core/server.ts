import type { IncomingMessage, ServerResponse } from 'node:http';
import { prefersMarkdown } from './accept';

export function shouldHandleDevRequest(
  req: IncomingMessage,
  preferPlainText: boolean,
  bypassHeaderName: string,
): boolean {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }

  if (req.headers[bypassHeaderName] === '1') {
    return false;
  }

  return prefersMarkdown(String(req.headers.accept ?? ''), preferPlainText);
}

export async function writeNodeResponse(
  res: ServerResponse,
  response: Response,
  headers: Headers,
): Promise<void> {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  for (const [key, value] of headers.entries()) {
    res.setHeader(key, value);
  }

  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
