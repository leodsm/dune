# AGENTS.md — Arquivo Arrakis

## Produto

Arquivo Arrakis é um produto editorial independente sobre Dune. O diferencial central não é ser uma wiki genérica: é **comparar adaptações e versões entre mídias**, transformar essas diferenças em páginas úteis e gerar derivados para feed social, Web Stories e vídeo curto.

## Prioridades

1. Mobile-first.
2. SEO e conteúdo original.
3. Performance e Core Web Vitals.
4. Monetização sem degradar a leitura.
5. Reutilização editorial: uma pesquisa deve alimentar página, comparação, card, story e vídeo.
6. Segurança: agentes criam rascunhos; publicação automática exige uma fase posterior.

## Arquitetura

- Regras de negócio ficam em plugins.
- Tema cuida de apresentação.
- `arrakis-core` concentra tipos de conteúdo, taxonomias, Abilities e APIs do domínio.
- Não colocar regras editoriais complexas em templates.
- Não armazenar segredos no Git.

## Modelo editorial planejado

- Entity: personagem, casa, facção, planeta, local, criatura, tecnologia, conceito etc.
- Work: livro, filme, série, game, HQ etc.
- Version/Portrayal: uma entidade em uma obra específica.
- Comparison: comparação editorial entre duas ou mais versões.
- Article: matéria/análise/guia.
- Social Card: unidade editorial visual 1080x1350.
- Short Video Brief: roteiro/brief para vídeo curto gerado ou editado com IA.

## Social Card

Formato canônico: **1080×1350 (4:5)**.

Um card deve armazenar, quando aplicável:

- título;
- gancho;
- texto principal;
- CTA;
- categoria editorial;
- entidades/obras relacionadas;
- prompt de imagem;
- alt text;
- legenda social;
- fonte/base da afirmação;
- status de revisão;
- URL/ID do asset final.

O site deve conseguir exibir esses cards em feed mobile sem depender da imagem social como única fonte do conteúdo textual.

## Vídeo curto

Vídeos são derivados editoriais, não substitutos da pesquisa. Estrutura preferida:

- 15–45 s para peças rápidas;
- até 90 s para explicações comparativas;
- hook nos primeiros segundos;
- roteiro dividido em cenas;
- prompt visual por cena;
- texto de narração separado;
- indicação de formato 9:16 quando destinado a Reels/Shorts/TikTok;
- origem e fontes registradas no conteúdo pai.

## Monetização

O código deve prever slots, mas anúncios não podem quebrar o fluxo principal. Priorizar slots como:

- feed entre blocos;
- após resumo de comparação;
- meio de artigo;
- story interstitial controlado;
- sticky mobile somente quando não encobrir conteúdo/controles.

## Copyright e conteúdo

- Não copiar textos extensos de livros, roteiros, wikis ou matérias.
- Não presumir que posters, frames e fotos promocionais são livres para uso.
- Priorizar análise original, dados estruturados, diagramas e ilustração editorial própria/licenciada.
- Sempre diferenciar fato confirmado, interpretação editorial e rumor.

## Desenvolvimento

Antes de alterar código:

1. leia `README.md`;
2. leia documentos relevantes em `docs/`;
3. preserve compatibilidade com WordPress e padrões oficiais;
4. execute validações disponíveis;
5. mantenha commits pequenos e descritivos.

## MCP

- As primeiras ferramentas MCP de escrita devem criar somente `draft`.
- Não implementar delete/publish via MCP sem pedido explícito e revisão de permissões.
- Toda Ability deve ter descrição clara, schema de entrada e saída e callback de permissão.
- Operações destrutivas devem ficar fora da primeira versão.

## Definição de pronto para a fundação

A fundação só está pronta quando:

- `wp-env` sobe sem erro;
- `arrakis-core` ativa;
- MCP Adapter está ativo;
- Codex enxerga o servidor configurado;
- ferramentas Arrakis aparecem em `tools/list`/`/mcp`;
- uma Ability de leitura funciona;
- criação de card, artigo e vídeo gera apenas rascunhos.
