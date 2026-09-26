# Auditoria do sistema Bona — 26/09/2026

Executor: Claude (somente leitura; nada foi alterado no Notion).
Recorte: Notion lido em 25–26/09/2026. Conectores do lado Claude. Rotinas do Claude.
Fora do recorte: Mac Mini, WACLI, Obsidian e rotinas do Grokbot. Esses pontos só foram vistos pelo
que os registros no Notion dizem sobre eles.

Severidade: 🔴 quebra uma regra ou deixa passar prazo · 🟡 degrada o sistema · 🟢 funciona

---

## 1. Veredito

A **arquitetura no papel é boa**: uma autoridade por tipo de informação, só rascunho sem GO,
recibo com releitura, Guia 48 com matriz de verificadores. O problema é a **execução**. As bases que
sustentam tudo (Frentes e Eisenhower) estão com dados incompletos, duplicados ou vencidos. Dos
loops, 3 rodam, 1 está morto e 1 foi abandonado. E a documentação cresce mais rápido do que é
consolidada. O sistema gasta mais energia se descrevendo do que operando.

---

## 2. Achados críticos (🔴)

| # | Achado | Evidência | Regra violada |
|---|---|---|---|
| C1 | **Pendência vencida há 11 dias sem alerta** | «Certificado digital e-CNPJ Jesus & Cia»: venc. 15/09, Status Aberta, Quadrante *Agendar*. O Lint de 23/09 anotou «Vencido 15/09 sem prova» e nada mudou | G48-10 (cobrar), G48-21 |
| C2 | **Pendências duplicadas, uma aberta e outra resolvida** | «Life Select — dossiê SCP → Cícero + SIC» (Aberta) × «… para Cícero + SIC» (Resolvido). «CENI / Potrich — aguardar retorno Ademilson» aparece 2× (Aberta e Resolvido) | Anti-regra duplicar; «um executor por registro» |
| C3 | **Quadrantes mudaram sem recibo** | Lint 23/09 19:30: Fazer agora 6 · Agendar 13 · Delegar 3. Lint 24/09 19:30: Fazer agora 2 · Agendar 28 · Delegar 0, e o mesmo log diz «nenhum quadrante alterado» | Recibo obrigatório; G48-24 |
| C4 | **Página canônica da Quadra G trocou de ID duas vezes** | Logs de 23/09: canônica = `3d45…b794` («`3dc5…cb9910` era página em branco»). Log de 25/09: canônica = `3dc5…cb9910`, espelho arquivado. A base Frentes aponta a `3dc5…` | Autoridade única por assunto |
| C5 | **Frente arquivada continua ativa e no escopo do lint** | Lint 25/09: «Jesus e Cia `3dc5…6ad35` ARQUIVADO → página empresa `3d45…365084c5`». Na base Frentes ela segue *Ativo*, e está no Escopo v1 do lint | Coerência de estado |
| C6 | **Loop de lint do corpo das frentes morto no executor oficial** | Custom Agent «Lint diário frentes»: `403 workspace_credits_exhausted`. O Grok está fazendo *bypass* sem aceite formal | Arquitetura v2 (dono do lint) |
| C7 | **O loop do Diário parou** | Diário W39: último bloco em «24/09 — manhã». Não há recap de 24/09 nem blocos de 25/09, e a regra diz que cada briefing grava um bloco | G48-41 (modo A) |

## 3. Organização e governança (🟡)

1. **Três "portas de entrada" disputam o mesmo papel.** O Guia 48 diz «Porta de entrada única (GO
   25/09 18:28)». A Arquitetura v2 diz «Método: topo dos Playbooks». Os Playbooks dizem «esta
   página é o gesto do dia». Um agente novo não sabe por onde começar. *Proposta:* Guia 48 = entrada
   (confirmada por GO); as outras duas só apontam para ele.
2. **Duas numerações de regra que não batem.** A base Playbooks usa `1-tom-acolhedor … 10-diário`.
   O Guia 48 usa 1–48, e lá o tom é a regra 11, não a 1. *Proposta:* trocar o select «Regra» pelo
   número do Guia 48.
3. **Excesso de agentes e nomes divergentes.** São 14 bots listados (CoS, Jurídico, Projects,
   Projetos, Haggle, Produtividade, US Investor, Work Log, Arquiteto, Operações, Concierge,
   Governança, Societário, Documentos), mais Grok, GPT, Codex, o Custom Agent e agora o Claude.
   «Projects» e «Projetos» coexistem. A Matriz 48 cita «Documentos & Renovações», «Work Log &
   Qualidade» e «Projects Manager», nomes que não batem com a lista de bots. A North Star pede
   «poucos agentes permanentes por papel».
4. **Muita página arquivada e marcada DEPRECIADO ainda no caminho.** A «Arquitetura de sistemas»
   está depreciada, mas continua na base Frentes («Pausado», Saúde **Verde**) e tem **168 mil
   caracteres**: estourou o limite de leitura de agente nesta auditoria. «Gestão do Notion» tem
   52 mil caracteres e mistura links canônicos, logs de rotina e histórico.
5. **Horário quieto contraditório.** G48-12: nada antes das 6h30. Log de 23/09 22:43: «nada de push
   antes das 08h». O briefing roda às 06h00. É preciso uma regra só.

## 4. Gestão do conhecimento

| Camada | Estado | Nota |
|---|---|---|
| Drive (originais + SHA-256) | 🟡 | Só ~30 mensagens ligadas a original por hash; a maioria das mídias não tem vínculo. PI Erik continua não localizada |
| Obsidian / WACLI (bruto) | 🟢 | ~94,7 mil mensagens em 957 conversas, índice a cada 15 min, 0 conflitos (25/09 17:45). Consulta por `radar.search/context` comprovada em GPT, Grok e CoS |
| Notion (estado) | 🟡 | Sínteses no topo funcionam onde o lint passa; bases estruturadas fracas (ver abaixo) |
| E-mail, Drive, Granola | 🔴 | Ingestão integral **não feita** (declarado na Gestão 24/09) |
| iPhone / voz | 🔴 | Não validados |

**Base Frentes (20 registros):**
- **16 de 20 sem «Responsável» preenchido.** O dono padrão é o João (G48-28), mas o campo vazio
  impede filtro e cobrança.
- **12 de 20 com Saúde «Sem avaliação»**; 7 sem «Última revisão».
- **Só 2 têm «Próximo marco»**, e o da Casa JV (22/09) já passou.
- **3 pausadas desde 30/07** (CRM do WhatsApp, Escritório de Projetos, Controladoria). A regra G48-21
  manda listar frente parada há mais de 7 dias, e isso não aparece em lugar nenhum.
- Várias frentes vivas **não existem na base**: Volvo XC90, Família/Unimed, Contábil, Governança,
  Jurídico/Cícero, Mesa de Investimentos, CENI Participações, AMJ. Elas só aparecem no texto das
  pendências ou como página solta na Central.

**Pendências → Frentes:** o campo «Frente» da Eisenhower é **texto livre**, não uma relação. O mesmo
assunto aparece com 3 grafias («🏠 Life Select Home», «Life Select Home — Jesus & Cia»…). Essa é a
aresta mais importante do grafo, e ela não existe como ligação.

## 5. Conectores

| Conector | Grok / CoS (segundo o Notion) | Claude (verificado agora) |
|---|---|---|
| Notion | ✅ ×2 | ✅ |
| Gmail | ✅ ×3 contas, só rascunho | ✅ 1 conexão (conta não confirmada) |
| Drive | ✅ ×2 | ✅ 1 conexão |
| Calendar | ✅ | ✅ |
| Granola | ✅ | ⚠️ conectado, mas **desligado nesta conversa** |
| WhatsApp (Bona Memory / WACLI) | ✅ só leitura | ❌ sem acesso |
| Harvey (jurídico) | — | ⚠️ instalado, **não conectado** |
| tldv, Zapier | — | ⚠️ não conectados |
| Supabase, Vercel, Adobe, Higgsfield | — | ✅ conectados, mas sem uso no Bona (sobras da FotoRestaura / criativos) |

Pendências herdadas: a conexão das mesmas ferramentas no lado do Codex (gap MCP #1) continua
**pendente**. A ponte por arquivo `ai.bona.codex-handoff` não está carregada e aponta para o vault
antigo. O Radar multicanal depende de o Codex manter o WACLI sincronizado, e a retirada dessa
dependência está pendente com o CoS.

## 6. Loops

| Loop | Horário | Evidência de execução | Estado |
|---|---|---|---|
| Índice Radar (Mini) | 15 min | 25/09 17:45 | 🟢 |
| Radar vencimentos | 08h | 24/09 08:07 · 25/09 08:09 | 🟢 |
| Calibração | 21h | 23, 24 e 25/09 | 🟢 |
| Briefing | 06h | indireto (a Calibração cita ganchos de 23 e 25/09) | 🟢 |
| Lint do corpo das frentes | 19h | Grok bypass 23, 24 e 25/09; Custom Agent 403 | 🟡 (executor não oficial) |
| Lint de pendências | 19h30 | 23 e 24/09; **nada em 25/09** | 🟡 |
| Diário semanal | com o briefing | último bloco 24/09 manhã | 🔴 |
| Feedback | 09h | pergunta pela DM **não sai** (depende do Codex) | 🔴 |
| Lint leve | 12h30/16h30 | «Limpeza 12:30» registrada na Gestão | 🟢 |
| Lint de estrutura | 20h50/21h | só a 1ª corrida (23/09) registrada | 🟡 |
| Limpeza profunda | sáb 10h | ainda não ocorreu | — |
| Auditoria mensal | fim de set/2026 | ainda não ocorreu | — |
| Rotinas do Claude | — | **0 rotinas** (`list_triggers` vazio) | — |

São **12 loops para uma pessoa**, com 4 tipos de lint sobrepostos (12h30, 16h30, 19h, 19h30,
20h50/21h). O parecer de 24/09 do próprio sistema já apontava «sobreposição de rotinas».
*Proposta:* juntar tudo em **2 lints** (um leve ao meio-dia e um completo às 19h, com as pendências
dentro) com um executor oficial.

## 7. Graphs

- O único grafo de dependências está no **Histórico** da Arquitetura v2 (23/09). Ele descreve
  «CoS interface única», a Ponte HTTP e «Projetos dono do Eisenhower», e tudo isso já foi
  superado. **A seção Vigente não tem grafo.**
- No Obsidian, as 24 mil referências de resposta/reação são vínculos de *mensagem*, não relações
  de negócio. O próprio registro faz essa ressalva, e está certo.
- Frente ↔ Pendência ↔ Compromisso ↔ Livro-caixa: só Ações e Livro-caixa usam relação de verdade.
  A Eisenhower usa texto.

## 8. Playbooks

- Base de 5 campos: **8 exemplos**, todos de 22–23/09, todos «ativo», todos com os 5 campos
  preenchidos. 🟢
- Categorias sem nenhum exemplo: `6-versionamento`, `9-veredito`, `10-diário`. A LR-07 exige ≥1
  anti-exemplo por regra ativa.
- O método «Como o agente trabalha no Notion» está bom: curto, com travas claras e critério de
  pronto. 🟢
- O histórico dentro da própria página de Playbooks mantém o manual RC-20260925 inteiro, o que
  torna a página longa. Ele poderia ir para o Arquivo com um ponteiro.

---

## 9. Plano de correção (ordem sugerida)

**Hoje (dados; sem GO, é trabalho interno):**
1. e-CNPJ: marcar Quadrante *Fazer agora* e cobrar (C1).
2. Fechar as duplicatas da Eisenhower (C2), mantendo o histórico.
3. Base Frentes: arquivar «Arquitetura de sistemas» e «Jesus e Cia `3dc5…6ad35`» (C5) e tirá-las do
   Escopo v1; registrar a canônica da Quadra G uma vez só (C4).

**Esta semana (precisa de GO):**
4. Converter «Frente» da Eisenhower em **relação** com a base Frentes; criar as frentes que faltam.
5. Preencher Responsável, Saúde e Próximo marco nas 16 frentes ativas.
6. Lint único com executor oficial: o Claude (rotina às 19h) no lugar do Custom Agent sem créditos.
7. Religar o Diário ao briefing.

**Estrutura (decisão do João):**
8. Uma porta de entrada (Guia 48), uma numeração de regras e um horário quieto.
9. Reduzir os bots para os papéis que a Matriz 48 usa.
10. Tirar a «Arquitetura de sistemas» (168 mil caracteres) do caminho dos agentes.
