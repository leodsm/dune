# Arquivo Arrakis

Projeto editorial independente sobre **Dune**, criado para comparar livros, filmes, séries, games e outras adaptações em uma experiência mobile-first.

## Objetivo

Construir um produto editorial com quatro frentes integradas:

1. **Enciclopédia** — personagens, casas, facções, locais, conceitos e obras.
2. **Comparador** — diferenças entre versões da mesma entidade em mídias diferentes.
3. **Feed editorial** — cards 1080x1350, matérias, Web Stories e publicidade.
4. **Vídeos curtos** — briefs e roteiros para vídeos gerados/assistidos por IA.

O projeto nasce pensando em SEO, distribuição social, retenção mobile e monetização, sem se apresentar como produto oficial da franquia.

## Stack inicial

- WordPress local via `@wordpress/env`
- PHP 8.2
- WordPress Abilities API
- WordPress MCP Adapter oficial
- Codex CLI
- MCP Streamable HTTP direto entre Codex e WordPress
- Docker Desktop
- GitHub como fonte de verdade do código

## Windows

O projeto funciona diretamente no **PowerShell**. WSL2 pode continuar como backend do Docker Desktop, mas você não precisa trabalhar dentro de um terminal Linux.

Pré-requisitos:

- Docker Desktop com virtualização ativa
- Node.js 22+
- Git
- Codex CLI

## Início rápido

```powershell
git clone https://github.com/leodsm/dune.git
cd dune
npm install
npm run doctor
npm run env:start
npm run wp:bootstrap
npm run mcp:check
npm run codex
```

Se o repositório já estiver clonado:

```powershell
git pull origin main
npm install
npm run mcp:check
npm run codex
```

> Neste projeto, prefira `npm run codex` em vez de abrir `codex` diretamente. O launcher injeta somente na sessão atual o cabeçalho de autenticação necessário para o WordPress MCP local.

Dentro do Codex:

```text
/mcp
```

O servidor deve aparecer como `wordpress_local`.

## Diagnóstico

```powershell
npm run doctor
```

Verifica Node.js, npm, Git, Docker CLI, Docker Engine e `wp-env`.

## WordPress local

- Site: http://localhost:8888
- Admin: http://localhost:8888/wp-admin/
- Usuário padrão do wp-env: `admin`
- Senha padrão do wp-env: `password`

Essas credenciais são somente do ambiente local descartável do `wp-env`. Nunca reutilize em produção.

## MCP local

O MCP Adapter oficial expõe o servidor padrão em:

```text
http://localhost:8888/wp-json/mcp/mcp-adapter-default-server
```

O Codex se conecta diretamente por **Streamable HTTP**. Não há proxy MCP intermediário.

`npm run mcp:check` faz um teste real de comunicação:

1. verifica Docker e wp-env;
2. confirma `mcp-adapter` e `arrakis-core` ativos;
3. cria ou valida uma WordPress Application Password local;
4. envia `initialize`;
5. envia `notifications/initialized`;
6. executa `tools/list`.

A credencial local fica em `.arrakis-mcp.local`, ignorado pelo Git.

## Primeiras Abilities MCP

O plugin `arrakis-core` registra Abilities para:

- verificar o estado do projeto;
- listar conteúdos;
- criar rascunho de matéria;
- criar rascunho de card social 1080x1350;
- criar brief de vídeo curto.

As operações de escrita começam limitadas a **rascunhos**. Publicação automática não faz parte da fundação inicial.

## Estrutura

```text
.
├── .codex/
│   └── config.toml
├── docs/
├── scripts/
│   ├── codex-arrakis.mjs
│   ├── doctor.mjs
│   ├── mcp-local-lib.mjs
│   └── mcp-smoke.mjs
├── wp-content/
│   └── plugins/
│       └── arrakis-core/
├── .wp-env.json
├── AGENTS.md
├── package.json
└── README.md
```

## Próxima fase

Depois de validar o MCP local, o desenvolvimento segue para:

1. modelo Entity → Work → Version → Comparison;
2. feed mobile 4:5;
3. sistema de cards sociais;
4. slots de anúncios;
5. player/briefs de vídeos curtos;
6. tema visual próprio;
7. SEO e dados estruturados;
8. integração MCP com staging/produção usando autenticação apropriada.
