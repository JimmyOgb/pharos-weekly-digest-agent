export interface McpSessionState {
  endpoint: string;
  sessionId?: string;
  cookie?: string;
  initialized: boolean;
  serverInfo?: { name: string; version: string };
}

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'https://mcp.pharos.xyz/mcp';

let sessionState: McpSessionState = {
  endpoint: MCP_ENDPOINT,
  initialized: false
};

/**
 * Initialize session with the official Pharos MCP server over SSE/HTTP
 */
export async function initMcpSession(force = false): Promise<McpSessionState> {
  if (sessionState.initialized && !force && sessionState.sessionId) {
    return sessionState;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  };

  try {
    const initRes = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'pharos-weekly-digest-agent', version: '1.0.0' }
        }
      })
    });

    if (!initRes.ok) {
      throw new Error(`MCP initialization returned status ${initRes.status}`);
    }

    const sessionId = initRes.headers.get('mcp-session-id') || undefined;
    const rawCookie = initRes.headers.get('set-cookie');
    const cookie = rawCookie ? rawCookie.split(';')[0].trim() : undefined;
    const initText = await initRes.text();

    let serverInfo: any = undefined;
    const dataLine = initText.split('\n').find(l => l.startsWith('data: '));
    if (dataLine) {
      try {
        const json = JSON.parse(dataLine.slice(6));
        serverInfo = json.result?.serverInfo;
      } catch {
        // non-fatal
      }
    }

    // Send notifications/initialized
    const notifHeaders: Record<string, string> = { ...headers };
    if (sessionId) notifHeaders['mcp-session-id'] = sessionId;
    if (cookie) notifHeaders['cookie'] = cookie;

    await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: notifHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {}
      })
    }).catch(() => {});

    sessionState = {
      endpoint: MCP_ENDPOINT,
      sessionId,
      cookie,
      initialized: true,
      serverInfo
    };

    return sessionState;
  } catch (err: any) {
    sessionState.initialized = false;
    throw new Error(`Official Pharos MCP init error (${MCP_ENDPOINT}): ${err.message}`);
  }
}

/**
 * Execute tool call on official Pharos MCP server
 */
export async function callMcpTool(toolName: string, args: Record<string, any> = {}): Promise<any> {
  await initMcpSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  };
  if (sessionState.sessionId) headers['mcp-session-id'] = sessionState.sessionId;
  if (sessionState.cookie) headers['cookie'] = sessionState.cookie;

  const res = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    })
  });

  if (!res.ok) {
    throw new Error(`MCP tool call ${toolName} failed with status ${res.status}`);
  }

  const text = await res.text();
  const dataLine = text.split('\n').find(l => l.startsWith('data: '));
  if (!dataLine) {
    throw new Error(`MCP tool ${toolName} returned unexpected format: ${text.slice(0, 200)}`);
  }

  const json = JSON.parse(dataLine.slice(6));
  if (json.error) {
    throw new Error(`MCP tool ${toolName} error: ${json.error.message || JSON.stringify(json.error)}`);
  }

  const content = json.result?.content;
  if (Array.isArray(content) && content.length > 0 && content[0].text) {
    try {
      return JSON.parse(content[0].text);
    } catch {
      return content[0].text;
    }
  }

  return json.result;
}
