import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const credentialFile = resolve(root, '.arrakis-mcp.local');

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });
}

function fail(message, detail = '') {
  console.error(message);
  if (detail) console.error(detail.trim());
  process.exit(1);
}

const npxVersion = run('npx', ['--version']);
if (npxVersion.error || npxVersion.status !== 0) {
  fail('npx não encontrado. Instale Node.js LTS e abra um novo terminal.');
}

const dockerVersion = run('docker', ['version', '--format', '{{.Server.Version}}']);
if (dockerVersion.error || dockerVersion.status !== 0) {
  fail(
    'Docker não está disponível. Abra o Docker Desktop e aguarde o Engine ficar ativo.',
    dockerVersion.stderr || dockerVersion.stdout,
  );
}

const wpStatus = run('npx', ['wp-env', 'status']);
if (wpStatus.status !== 0) {
  fail('O wp-env não está ativo. Rode primeiro: npm run env:start', wpStatus.stderr || wpStatus.stdout);
}

function createCredentials() {
  const result = run('npx', [
    'wp-env',
    'run',
    'cli',
    'wp',
    'user',
    'application-password',
    'create',
    'admin',
    'Arrakis Codex MCP',
    '--porcelain',
  ]);

  if (result.status !== 0) {
    fail('Não foi possível criar a Application Password local do WordPress.', result.stderr || result.stdout);
  }

  const combined = `${result.stdout}\n${result.stderr}`;
  const matches = combined.match(/(?:[A-Za-z0-9]{4}\s+){5}[A-Za-z0-9]{4}|[A-Za-z0-9]{24}/g);
  const password = matches?.at(-1)?.trim();

  if (!password) {
    fail('A Application Password foi criada, mas não consegui identificar o valor retornado.', combined);
  }

  const content = [
    'WP_API_URL=http://localhost:8888/wp-json/mcp/mcp-adapter-default-server',
    'WP_API_USERNAME=admin',
    `WP_API_PASSWORD=${password}`,
    'OAUTH_ENABLED=false',
    '',
  ].join('\n');

  writeFileSync(credentialFile, content, { encoding: 'utf8', mode: 0o600 });
  try { chmodSync(credentialFile, 0o600); } catch {}
}

if (!existsSync(credentialFile)) {
  createCredentials();
}

const env = { ...process.env };
for (const line of readFileSync(credentialFile, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const index = line.indexOf('=');
  if (index === -1) continue;
  env[line.slice(0, index)] = line.slice(index + 1);
}

env.OAUTH_ENABLED = env.OAUTH_ENABLED || 'false';

const child = spawn(
  'npx',
  ['-y', '@automattic/mcp-wordpress-remote@latest'],
  {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (error) => fail('Falha ao iniciar o proxy MCP do WordPress.', error.message));
