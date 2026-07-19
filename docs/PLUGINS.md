# Plugins & Skills — Claude Code

Ferramentas de desenvolvimento **para quem trabalha neste repo com Claude Code**. Nada aqui
roda em produção — é tooling de sessão (revisão de segurança, memória, docs atualizadas,
economia de tokens, metodologia).

Duas camadas:

1. **Configurados no repo** (`.claude/settings.json` + `.mcp.json`): ao abrir o projeto e
   confiar na pasta, o Claude Code oferece instalar automaticamente os plugins do time e o
   servidor MCP Context7.
2. **Catálogo opcional** (skills do "Top 10 — @aiedge_, jul/2026"): cada dev instala o que
   quiser, por conta própria — a maioria é escopo pessoal (`~/.claude/skills`), não do projeto.

> Para recusar um plugin do time só para você: `/plugin` → **Installed** → disable (grava
> override em `.claude/settings.local.json`, que não é versionado).

---

## 1. Plugins do time

Os 5 indicados originalmente, mais dois promovidos do Top 10 (seção 2) por decisão do time:

| Plugin | O que é | Por que vale para o FotoRestaura |
|---|---|---|
| **Superpowers** | Metodologia completa (brainstorm → plano → TDD → debug sistemático → review) em skills componíveis | Disciplina ao evoluir a esteira (webhooks, cobrança) sem quebrar o que já fatura |
| **Context7** (MCP) | Docs atualizadas e por versão de qualquer lib, direto no prompt | Next.js 14, `@google/genai`, Supabase, Mercado Pago e WhatsApp Cloud API mudam rápido — menos API alucinada |
| **Claude Mem** | Memória persistente entre sessões (captura → comprime → reinjeta contexto) | Decisões do produto (preço, quirks do webhook da Meta, formato do Pix) sobrevivem de uma sessão para outra |
| **Caveman** | Modo de saída ultracomprimido (~65–75% menos tokens de output) | Sessões longas mais baratas; ative com `/caveman` quando quiser |
| **Security Guidance** (oficial Anthropic) | Revisão de segurança em 3 camadas: avisos por padrão perigoso em Edit/Write, revisão LLM do diff a cada turno e revisão agêntica no `git commit` | **O mais importante para nós**: o repo processa pagamento (Pix), tokens do WhatsApp e fotos de clientes — injection, SSRF, segredo hardcoded e IDOR são riscos reais aqui |
| **/last30days** (do Top 10) | Pesquisa qualquer tema nos últimos 30 dias em Reddit, X, YouTube, HN etc., ranqueado por engajamento real | Pauta de criativos e ângulos de anúncio baseados no que roda de verdade |
| **/watch** — Claude-Video (do Top 10) | Baixa vídeo, extrai frames e transcrição — o Claude "assiste" | Analisar anúncios concorrentes e nossos criativos |

### Instalação manual (se o prompt automático não aparecer)

```text
/plugin install superpowers@claude-plugins-official
/plugin install security-guidance@claude-plugins-official

/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@thedotmack

/plugin marketplace add mihai-pompiliu/caveman_claude-code-plugin
/plugin install caveman@caveman

/plugin marketplace add mvanhorn/last30days-skill
/plugin install last30days@last30days-skill

/plugin marketplace add bradautomates/claude-video
/plugin install watch@claude-video
```

Depois rode `/reload-plugins` (ou reinicie a sessão).

**Context7** é um servidor MCP, não um plugin — vem configurado no [`.mcp.json`](../.mcp.json)
versionado no repo (ao abrir o projeto, o Claude Code pede aprovação do servidor). Funciona
sem chave, com rate limit menor; chave gratuita em
[context7.com/dashboard](https://context7.com/dashboard) — configure por dev com
`npx ctx7 setup --claude` ou passando o header `CONTEXT7_API_KEY`.

### Requisitos e observações

- **Security Guidance:** Claude Code ≥ 2.1.144 e Python 3.8+ no PATH.
- **Claude Mem:** Node 20+; instala `bun` e `uv` sozinho e roda um worker local (SQLite +
  busca vetorial). É o mais "pesado" dos cinco — se incomodar, desabilite só para você.
- **Caveman:** upstream é [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman);
  o marketplace que usamos é o empacotamento do link indicado. Níveis: lite, full, ultra.
- **Superpowers:** também existe no marketplace do autor (`obra/superpowers-marketplace`),
  mas a versão do marketplace oficial basta.
- **/watch (Claude-Video):** requer `ffmpeg` + `yt-dlp` na máquina; a primeira execução guia a
  instalação. Chave Whisper (Groq/OpenAI) só para vídeo sem legenda — opcional.
- **/last30days:** funciona sem chave (Reddit, HN, Polymarket, GitHub); X/YouTube/TikTok são
  opt-in no wizard da primeira execução, com chave própria.

---

## 2. Catálogo — "Top 10 AI Skills" (imagem @aiedge_, jul/2026)

Ranking da imagem, com o que verificamos e a relevância **para este projeto**. Dois deles
(`/last30days` e `/watch`) foram **promovidos a plugins do time** — ver seção 1. O restante é
opcional, por dev: instalação via [`npx skills`](https://skills.sh) vai para `~/.claude/skills`
(pessoal); nada disso entra no repo sem revisão (ver seção 3).

| # | Skill | O que faz | Relevância p/ nós | Instalação |
|---|---|---|---|---|
| 1 | **Taste Skill** ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)) | Framework anti-slop de frontend (layout, tipografia, motion); variantes minimalist, brutalist, redesign-audit etc. | **Alta** — a landing é nossa vitrine de conversão | `npx skills add https://github.com/Leonxlnx/taste-skill` |
| 2 | **/improve** ([shadcn/improve](https://github.com/shadcn/improve)) | Audita o codebase em 9 categorias (correção, segurança, perf, testes…) e gera planos executáveis para um modelo mais barato | **Alta** — auditoria periódica da esteira | `npx skills add shadcn/improve` |
| 3 | **Security Unbroker** (NousResearch/hermes-agent) | Remove seu PII de data brokers | **N/A** — skill nativa do harness Hermes, não do Claude Code; e é pessoal, não do projeto | `hermes skills install official/security/unbroker` |
| 4 | **Shannon Pentester** ([KeygraphHQ/shannon](https://github.com/KeygraphHQ/shannon)) | Pentester white-box autônomo: lê o código, monta vetores e prova exploits de verdade | **Alta, com cuidado** — nossos webhooks de pagamento/WhatsApp merecem pentest. **Só em staging/sandbox do NOSSO app, nunca produção nem terceiros.** Requer Docker + Node 18+ | `npx @keygraph/shannon setup` |
| 5 | **Unslop UI** ([JCarterJohnson/vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells)) | Remove os "tells" de site feito por IA (gradiente roxo, hero centrado + 3 cards, emoji como ícone…) | **Média** — complementa o Taste na landing | baixar o `.skill` do repo e `unzip` em `~/.claude/skills/` |
| 6 | **GOG — Workspace CLI** (clawhub.ai/steipete) | CLI de Google Workspace (Gmail, Drive, Docs…) | **N/A** — é para o harness OpenClaw | `openclaw skills install @steipete/gog` |
| 7 | **Kill AI Slop** ([hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)) | Corta os tells de escrita de IA (frases proibidas, contrastes binários, voz passiva) e pontua o texto em 5 dimensões | **Alta** — copy da landing e legendas/hashtags da `lib/marketing.ts` sem cara de IA | sem instalador: copiar o `SKILL.md` do repo para `~/.claude/skills/stop-slop/` |
| 8 | **/last30days** ([mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)) | Pesquisa qualquer tema nos últimos 30 dias em Reddit, X, YouTube, HN etc., ranqueado por engajamento real | **Alta** — pauta de criativos e ângulos de anúncio baseados no que está rodando de verdade | ✅ **já habilitado para o time** via `.claude/settings.json` |
| 9 | **Claude-Video** ([bradautomates/claude-video](https://github.com/bradautomates/claude-video)) | `/watch`: baixa vídeo, extrai frames e transcrição — o Claude "assiste" | **Média** — analisar anúncios concorrentes e nossos criativos. Requer `ffmpeg` + `yt-dlp` | ✅ **já habilitado para o time** via `.claude/settings.json` |
| 10 | **/loopy** ([Forward-Future/loop-library](https://github.com/Forward-Future/loop-library)) | Transforma prompts one-shot em loops com feedback (descobrir, auditar, adaptar, rodar) | **Média** — ex.: loop de avaliação de qualidade de restauração em lote | `npx skills add Forward-Future/loopy --skill loopy --agent claude-code -g -y` |

Todos os repos acima foram verificados (existem e fazem o que a imagem diz), exceto os dois
N/A, que são de outros harnesses e não foram testados.

---

## 3. Segurança / supply chain

- Plugin e skill **executam com os seus privilégios**. A Anthropic não audita conteúdo de
  marketplace de terceiros — instale só o que confia, e leia o `SKILL.md`/hooks antes.
- Nada de `curl | bash` sem ler o script antes (alguns instaladores da imagem são assim).
- Skill de terceiro **não entra versionada neste repo** sem revisão do conteúdo (skill é
  instrução que direciona o agente — trate como código).
- **Shannon**: ferramenta de pentest é dual-use. Uso autorizado apenas: nosso app, ambiente
  de staging/sandbox, nunca contra terceiros ou produção.
- Os plugins do time ficam fixos em `.claude/settings.json` — mudança ali passa por PR, como
  qualquer código.
