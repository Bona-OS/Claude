# Wiki Bona — schema (v1, 26/09/2026)

Regras da wiki do Obsidian no Mini, no modelo «LLM Wiki» do Karpathy. Este arquivo é copiado para a
raiz do vault como `SCHEMA.md`; o original vive neste repositório (mudou aqui, recopia lá).

## 1. Camadas
| Pasta | O que é | Quem escreve |
|---|---|---|
| `raw/` | fonte bruta, **imutável**: nada é editado nem apagado depois de entrar | só os scripts de captura |
| `wiki/` | conhecimento organizado, escrito e mantido pelo LLM | só o agente de ingest (e correções do lint) |
| `SCHEMA.md` | estas regras | repositório Bona-OS/Claude |

```
raw/whatsapp/<chat>/<AAAA-MM>.md      raw/email/<conta>/<AAAA-MM>/<id>.md
raw/drive/<pasta>/<nome>.md (+ link e SHA-256 do original)
raw/reunioes/<AAAA-MM-DD>-<título>.md  raw/agenda/<AAAA-MM>.md
wiki/entes/<Nome>.md   wiki/frentes/<Frente>.md   wiki/contratos/<Contrato>.md
wiki/index.md          wiki/log.md                wiki/lint/<AAAA-MM-DD>.md
```

## 2. Nota da wiki (poucas notas grandes, não muitas pequenas)
Uma nota por **ente** (pessoa, empresa), **frente** (assunto durável) ou **contrato**. Estrutura fixa:

```markdown
---
tipo: ente | frente | contrato
nome: …
notion: <url da página no Notion, se houver>
atualizado: AAAA-MM-DD
confianca: alta | media | baixa
---
# Nome
> [!summary] Estado atual (≤ 5 linhas: o que é, situação, próximo passo, próximo vencimento)

> [!info]- Pessoas e papéis
> …links [[wiki/entes/…]]

> [!note]- Linha do tempo
> - AAAA-MM-DD — fato — [[raw/…#bloco]]

> [!warning]- Pendências e lacunas
> - …

> [!quote]- Documentos
> - ![[raw/drive/…]] · link do original
```

- **Toda afirmação** tem ponteiro para a fonte em `raw/` (link de bloco). Sem fonte = vai para
  «Pendências e lacunas», nunca para o estado atual.
- Conflito entre fontes: registrar os dois lados com fonte e marcar `confianca: baixa`.
- Estimativa: «ESTIMATIVA — A APURAR» + referência usada.
- Callouts recolhidos (`-`) para manter a nota curta à primeira vista.

## 3. Operações
| Operação | Quando | Executor | Revisor |
|---|---|---|---|
| **Captura** | contínua (WhatsApp 15 min; e-mail, agenda, reuniões 1 h; Drive diário) | scripts | checagem automática (contagem, hash) |
| **Ingest** | após cada lote novo em `raw/` | Claude (Mini) | — |
| **Lint wiki** | diário, 02h | Grok (Mini) | Claude corrige o apontado |
| **Consolidação → Notion** | diário, 05h | Claude | Grok confere contra `raw/` |
| **Lint Notion** | semanal | Grok | Claude corrige |
| **Orquestração** | sempre | Grokbot (só dispara, cobra e avisa) | — |

Executor não revisa o próprio trabalho. Revisão obrigatória no que mexe com dinheiro, prazo,
direito ou obrigação; o resto por amostra.

### Ingest (prompt-base)
Leia os arquivos novos de `raw/` desde a última execução (ver `wiki/log.md`). Para cada fato
relevante: ache a nota do ente/frente/contrato (crie só se não existir), acrescente na linha do tempo
com link para a fonte, atualize o «Estado atual» se mudou, mova para «Pendências» o que ficou sem
fonte. Atualize `wiki/index.md`. Registre em `wiki/log.md`: data, arquivos lidos, notas alteradas.
Não edite `raw/`. Não apague conteúdo da wiki; substitua marcando o que mudou.

### Lint (prompt-base)
Varra `wiki/`: contradições entre notas; «Estado atual» sem fonte ou mais velho que a fonte mais
nova; notas órfãs (sem link de entrada); links quebrados para `raw/`; duplicatas do mesmo ente;
vencimentos passados sem desfecho; afirmações `confianca: baixa` há mais de 7 dias. Escreva o
relatório em `wiki/lint/AAAA-MM-DD.md` (achado · nota · sugestão). Não corrija: quem corrige é o
agente de ingest.

## 4. Relação com o Notion
O Notion recebe só o **estado atual compacto** de cada nota (resumo, próximos vencimentos, ações),
com link de volta para a nota da wiki. Um escritor por área; reserva do alvo por `office.delta`.
