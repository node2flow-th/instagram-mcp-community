/**
 * Cloudflare Worker entry — Stateless Streamable HTTP MCP
 */

import {
  WebStandardStreamableHTTPServerTransport,
} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { createServer } from './server.js';
import { TOOLS } from './tools.js';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id, Accept, mcp-protocol-version',
    'Access-Control-Expose-Headers': 'mcp-session-id',
  };
}

function addCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === '/' && request.method === 'GET') {
      return addCors(Response.json({
        name: 'instagram-mcp',
        version: '1.0.0',
        status: 'ok',
        tools: TOOLS.length,
        transport: 'streamable-http',
        endpoints: { mcp: '/mcp' },
      }));
    }

    if (url.pathname !== '/mcp') {
      return addCors(new Response('Not Found', { status: 404 }));
    }

    if (request.method !== 'POST') {
      return addCors(Response.json(
        { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed. Use POST.' }, id: null },
        { status: 405 }
      ));
    }

    const accessToken = url.searchParams.get('INSTAGRAM_ACCESS_TOKEN') || '';
    const accountId = url.searchParams.get('INSTAGRAM_ACCOUNT_ID') || undefined;
    const config = accessToken ? { accessToken, accountId } : undefined;

    try {
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      const server = createServer(config);
      await server.connect(transport);

      const response = await transport.handleRequest(request);
      return addCors(response);
    } catch (error: any) {
      return addCors(Response.json(
        { jsonrpc: '2.0', error: { code: -32603, message: error.message || 'Internal server error' }, id: null },
        { status: 500 }
      ));
    }
  },
};
