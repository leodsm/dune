import { spawnSync } from 'node:child_process';

const checks = [];

function run(label, command, args, hint, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });

  const ok = !result.error && result.status === 0;
  checks.push({ label, ok, hint, output: (result.stdout || result.stderr || '').trim() });
  return ok;
}

run('Node.js', 'node', ['--version'], 'Instale Node.js LTS.');
run('npm', 'npm', ['--version'], 'O npm vem com o Node.js LTS.');
run('Git', 'git', ['--version'], 'Instale Git for Windows.');
const dockerCli = run('Docker CLI', 'docker', ['--version'], 'Instale o Docker Desktop e abra um novo terminal.');
if (dockerCli) {
  run('Docker Engine', 'docker', ['info', '--format', '{{.ServerVersion}}'], 'Abra o Docker Desktop e espere aparecer Engine running.');
}
run('wp-env', 'npx', ['wp-env', '--version'], 'Rode npm install na raiz do projeto.');

console.log('\nArquivo Arrakis — diagnóstico local\n');
for (const check of checks) {
  console.log(`${check.ok ? 'OK ' : 'ERRO'}  ${check.label}${check.output ? ` — ${check.output.split(/\r?\n/)[0]}` : ''}`);
  if (!check.ok) console.log(`      ${check.hint}`);
}

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.log(`\n${failures.length} requisito(s) precisam de atenção.`);
  process.exit(1);
}

console.log('\nTudo pronto para executar: npm run env:start');
