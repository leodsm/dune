# MCP local — WordPress + Codex CLI

## Objetivo

Ter o WordPress local do Arquivo Arrakis disponível como servidor MCP dentro do Codex CLI usando o **MCP Adapter oficial do WordPress**.

O fluxo local usa STDIO porque é o caminho mais simples e seguro para desenvolvimento.

## Pré-requisitos

No Windows, use WSL2.

Instale:

- Docker Desktop com integração WSL2;
- Node.js LTS;
- npm/npx;
- Git;
- Codex CLI.

## Instalação

```bash
git clone https://github.com/leodsm/dune.git
cd dune
npm install
npm run env:start
npm run wp:bootstrap
```

Verifique:

```bash
npm run wp:status
```

Você deve ver `mcp-adapter` e `arrakis-core` ativos.

## Abrir no navegador

- Site: http://localhost:8888
- Admin: http://localhost:8888/wp-admin/
- usuário local: `admin`
- senha local: `password`

Essas credenciais pertencem apenas ao ambiente descartável do `wp-env`.

## Codex

Na raiz do repositório:

```bash
codex
```

Confie no projeto quando o Codex solicitar. Isso permite carregar a configuração local em `.codex/config.toml`.

Depois use:

```text
/mcp
```

O servidor esperado é:

```text
wordpress_local
```

Também é possível conferir a configuração do Codex pelo terminal:

```bash
codex mcp list
```

## Teste funcional

Peça ao agente:

```text
Use o MCP do WordPress e execute a ferramenta de estado do Arquivo Arrakis.
```

A ferramenta `arrakis/get-project-status` deve retornar:

- nome do projeto;
- versão do Arrakis Core;
- versão do WordPress;
- URL local.

Depois teste escrita segura:

```text
Crie no WordPress um rascunho de card 1080x1350 sobre Paul Atreides comparando livro e cinema. Não publique.
```

O resultado deve ser um `arrakis_card` com status `draft`.

## Ferramentas iniciais

- `arrakis/get-project-status`
- `arrakis/list-editorial-content`
- `arrakis/create-article-draft`
- `arrakis/create-card-draft`
- `arrakis/create-video-brief-draft`

## Segurança inicial

As três ferramentas de criação:

- exigem usuário com capacidade `edit_posts`;
- criam somente rascunhos;
- não deletam conteúdo;
- não publicam conteúdo;
- não alteram configurações globais do WordPress.

## Produção/staging

Não reutilize o transporte local em produção.

Para um WordPress remoto, a fase posterior deverá usar o endpoint HTTP do MCP Adapter com autenticação própria do WordPress, preferencialmente Application Password dedicada a um usuário de automação com permissões mínimas.

Nunca versionar senhas, tokens ou Application Passwords no GitHub.

## Diagnóstico

### WordPress não sobe

```bash
npm run env:stop
npm run env:start
```

Confira se o Docker Desktop está executando.

### Plugin não ativa

```bash
npm run wp:status
npm run wp -- plugin list
```

### MCP não aparece no Codex

1. confirme que abriu o Codex dentro da raiz do repositório;
2. confirme que o projeto foi marcado como confiável;
3. rode `codex mcp list`;
4. teste `npm run mcp:stdio` fora do Codex para identificar erros de bootstrap;
5. confirme os plugins com `npm run wp:status`.

### Reset completo do ambiente local

```bash
npm run env:destroy
npm run env:start
npm run wp:bootstrap
```
