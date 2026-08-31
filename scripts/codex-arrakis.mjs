import { spawn } from 'node:child_process';
import { checkLocalEnvironment, getValidAuthorization, root } from './mcp-local-lib.mjs';

checkLocalEnvironment();
const authorization = await getValidAuthorization();

const env = {
  ...process.env,
  ARRAKIS_MCP_AUTH: authorization,
};

console.log('Arquivo Arrakis — abrindo Codex com autenticação MCP local...\n');

const child = spawn('codex', [], {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error(`Falha ao abrir o Codex: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => process.exit(code ?? 0));
