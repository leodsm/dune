import { checkLocalEnvironment, endpoint, fail, getValidAuthorization } from './mcp-local-lib.mjs';

checkLocalEnvironment();
const authorization = await getValidAuthorization();

const baseHeaders = {
  Authorization: authorization,
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

async function post(body, sessionId = '') {
  const headers = { ...baseHeaders };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    fail(`MCP respondeu HTTP ${response.status}.`, text);
  }
  return { response, text };
}

function parsePayload(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);

  // Streamable HTTP may return SSE. Extract the last data: JSON event.
  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (!dataLines.length) fail('Resposta MCP recebida, mas não consegui interpretar o JSON.', text);
  return JSON.parse(dataLines.at(-1));
}

console.log('\nArquivo Arrakis — teste MCP real\n');
console.log(`Endpoint: ${endpoint}`);

const init = await post({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'arrakis-smoke-test', version: '0.1.0' },
  },
});

const initPayload = parsePayload(init.text);
if (initPayload.error) fail('O MCP recusou initialize.', JSON.stringify(initPayload.error, null, 2));
const sessionId = init.response.headers.get('mcp-session-id') || '';
console.log(`OK   initialize — ${initPayload.result?.serverInfo?.name || 'servidor respondeu'}`);

await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId);

const toolsResponse = await post({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {},
}, sessionId);
const toolsPayload = parsePayload(toolsResponse.text);
if (toolsPayload.error) fail('O MCP recusou tools/list.', JSON.stringify(toolsPayload.error, null, 2));

const tools = toolsPayload.result?.tools || [];
console.log(`OK   tools/list — ${tools.length} ferramenta(s) MCP`);
for (const tool of tools) console.log(`     - ${tool.name}`);

console.log('\nMCP do WordPress está saudável e pronto para o Codex.\n');
