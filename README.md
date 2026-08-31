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

- WordPress (última versão estável suportada pelo `wp-env`)
- PHP 8.2
- WordPress Abilities API
- WordPress MCP Adapter oficial
- Codex CLI + MCP
- `@wordpress/env` para desenvolvimento local
- GitHub como fonte de verdade do código

## Início rápido

Pré-requisitos recomendados no Windows:

- WSL2
- Docker Desktop com backend WSL2
- Node.js LTS
- Git
- Codex CLI

Depois:

```bash
git clone https://github.com/leodsm/dune.git
cd dune
npm install
npm run env:start
npm run wp:bootstrap
codex
```

Dentro do Codex, confirme o MCP com:

```text
/mcp
```

Ou no terminal:

```bash
codex mcp list
```

O servidor MCP do projeto é configurado em `.codex/config.toml` e usa o WordPress local via WP-CLI/STDIO.

## WordPress local

- Site: http://localhost:8888
- Admin: http://localhost:8888/wp-admin/
- Usuário padrão do wp-env: `admin`
- Senha padrão do wp-env: `password`

> Essas credenciais são somente do ambiente local descartável do `wp-env`. Nunca reutilize em produção.

## Primeiras Abilities MCP

O plugin `arrakis-core` registra ferramentas para:

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
│   ├── CONTENT-SYSTEM.md
│   └── MCP-SETUP.md
├── scripts/
│   └── mcp-wordpress-local.sh
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
