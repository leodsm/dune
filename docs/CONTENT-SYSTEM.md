# Sistema de conteúdo — Arquivo Arrakis

## Princípio

Uma pauta deve poder gerar vários produtos sem duplicar pesquisa.

```text
PESQUISA BASE
   ├── matéria/guia
   ├── comparação
   ├── card 1080x1350
   ├── carrossel
   ├── Web Story
   └── vídeo curto
```

## Feed mobile

O feed do site será inspirado no consumo de redes sociais, mas continuará sendo HTML indexável e acessível.

### Unidade principal

- proporção visual prioritária: 4:5;
- asset social: 1080×1350 px;
- título/gancho disponível também em HTML;
- imagem com alt text;
- link para conteúdo aprofundado;
- possibilidade de inserir anúncio entre unidades;
- possibilidade de misturar card, comparação, matéria e vídeo.

## Card 1080×1350

Campos iniciais do `arrakis_card`:

- título;
- conteúdo textual;
- resumo;
- hook;
- CTA;
- prompt de imagem;
- alt text;
- legenda social;
- largura canônica 1080;
- altura canônica 1350;
- proporção 4:5.

Na próxima sprint serão adicionados:

- entidades relacionadas;
- obras relacionadas;
- fontes;
- template visual;
- status de checagem;
- asset final;
- variações de arte;
- carrossel/paginação.

## Vídeos com IA

Faz sentido quando o vídeo acrescenta distribuição e retenção, principalmente para:

- comparações rápidas;
- explicação de personagem;
- linha do tempo;
- “no livro × no filme”;
- preparação para lançamento;
- curiosidades verificadas.

Não gerar vídeo apenas para preencher espaço.

### Fluxo sugerido

1. pesquisa e fontes;
2. criação do brief no WordPress via MCP;
3. roteiro/narração;
4. storyboard e prompts;
5. geração dos takes/elementos;
6. montagem final em CapCut/Premiere;
7. revisão factual/visual;
8. publicação;
9. incorporação no conteúdo pai.

### Formatos

- 9:16 — Reels, Shorts, TikTok e stories;
- 4:5 — feed e peças híbridas;
- 16:9 — YouTube/site quando necessário.

A Ability inicial aceita duração de 5 a 90 segundos e guarda narração e prompts visuais como metadados do brief.

## Publicidade

O feed deve tratar anúncio como um tipo de bloco, não como HTML perdido dentro da página.

Slots planejados:

- `feed-after-n`
- `comparison-after-summary`
- `article-mid`
- `story-interstitial`
- `mobile-sticky`

Regras:

- nunca inserir anúncio no meio de controles interativos;
- limitar densidade;
- reservar espaço para evitar CLS;
- identificar publicidade claramente;
- medir impressão e clique sem interferir no conteúdo editorial.
