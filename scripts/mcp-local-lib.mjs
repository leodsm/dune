import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const root = resolve(here, '..');
export const endpoint = 'http://localhost:8888/wp-json/mcp/mcp-adapter-default-server';
const credentialFile = resolve(root, '.arrakis-mcp.local');

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });
}

export function fail(message, detail = '') {
  console.error(`ERRO  ${message}`);
  if (detail) console.error(String(detail).trim());
  process.exit(1);
}

export function checkLocalEnvironment() {
  const docker = run('docker', ['version', '--format', '{{.Server.Version}}']);
  if (docker.error || docker.status !== 0) {
    fail('Docker Engine não está disponível. Abra o Docker Desktop.', docker.stderr || docker.stdout);
  }

  const wpEnv = run('npx', ['wp-env', 'status']);
  if (wpEnv.error || wpEnv.status !== 0) {
    fail('O wp-env não está ativo. Rode primeiro: npm run env:start', wpEnv.stderr || wpEnv.stdout);
  }

  for (const plugin of ['mcp-adapter', 'arrakis-core']) {
    const status = run('npx', ['wp-env', 'run', 'cli', 'wp', 'plugin', 'status', plugin]);
    const output = `${status.stdout || ''}\n${status.stderr || ''}`;
    if (status.status !== 0 || !/Status:\s+Active/i.test(output)) {
      fail(`O plugin ${plugin} não está ativo. Rode: npm run wp:bootstrap`, output);
    }
  }
}

function parseCredentialFile() {
  if (!existsSync(credentialFile)) return null;
  const values = {};
  for (const line of readFileSync(credentialFile, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    values[line.slice(0, idx)] = line.slice(idx + 1);
  }
  if (!values.WP_API_USERNAME || !values.WP_API_PASSWORD) return null;
  return values;
}

function createCredentials() {
  const result = run('npx', [
    'wp-env', 'run', 'cli', 'wp',
    'user', 'application-password', 'create',
    'admin', 'Arrakis-Codex-MCP', '--porcelain',
  ]);

  if (result.error || result.status !== 0) {
    fail('Não foi possível criar a Application Password local.', result.stderr || result.stdout);
  }

  const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
  const matches = combined.match(/(?:[A-Za-z0-9]{4}\s+){5}[A-Za-z0-9]{4}|[A-Za-z0-9]{24}/g);
  const password = matches?.at(-1)?.trim();
  if (!password) {
    fail('A senha foi criada, mas o valor não pôde ser identificado.', combined);
  }

  const values = {
    WP_API_USERNAME: 'admin',
    WP_API_PASSWORD: password,
  };

  writeFileSync(
    credentialFile,
    `WP_API_USERNAME=${values.WP_API_USERNAME}\nWP_API_PASSWORD=${values.WP_API_PASSWORD}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
  return values;
}

export function getCredentials({ forceNew = false } = {}) {
  if (!forceNew) {
    const existing = parseCredentialFile();
    if (existing) return existing;
  }
  return createCredentials();
}

export function makeAuthorization(credentials) {
  const raw = `${credentials.WP_API_USERNAME}:${credentials.WP_API_PASSWORD}`;
  return `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
}

export async function verifyWordPressAuth(authorization) {
  try {
    const response = await fetch('http://localhost:8888/wp-json/wp/v2/users/me?context=edit', {
      headers: { Authorization: authorization },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getValidAuthorization() {
  let credentials = getCredentials();
  let authorization = makeAuthorization(credentials);

  if (!(await verifyWordPressAuth(authorization))) {
    credentials = getCredentials({ forceNew: true });
    authorization = makeAuthorization(credentials);
    if (!(await verifyWordPressAuth(authorization))) {
      fail('A Application Password foi criada, mas o WordPress recusou a autenticação.');
    }
  }

  return authorization;
}
