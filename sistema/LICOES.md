# Lições da v1 (setembro/2026)

Por que o Manual v0 é do jeito que é. Cada lição veio de um problema observado
(fonte: `docs/AUDITORIA-2026-09-26.md` e páginas do Notion lidas em 25–26/09).

| # | O que aconteceu | Lição → regra no Manual |
|---|---|---|
| 1 | Configuração espalhada em ~15 páginas, cada uma com histórico e banners DEPRECIADO; agentes liam trechos antigos marcados «VIGENTE» | Configuração num arquivo só, versionado; histórico = git (§ topo) |
| 2 | Três páginas diziam ser a «porta de entrada» | Um arquivo; não há porta a escolher |
| 3 | 14 bots, nomes duplicados («Projects» × «Projetos»), matriz citando agentes inexistentes | 3 papéis; agente novo só removendo outro (§3) |
| 4 | 12 rotinas, 5 lints sobrepostos; executor oficial do lint morreu (créditos) e ninguém percebeu | 3 rotinas, 1 executor cada; falha aparece no briefing (§4) |
| 5 | Logs de rotina anexados a páginas de configuração (Gestão com 52 mil caracteres; Arquitetura com 168 mil) | Log técnico fora do Notion (§2) |
| 6 | Pendência → Frente em texto livre, com 3 grafias para o mesmo assunto | Relação obrigatória (§2) |
| 7 | Página canônica da Quadra G trocou de ID duas vezes; «espelhos» | Um lugar por coisa, nunca espelho (regra 2) |
| 8 | Quadrantes mudaram sem registro e com log dizendo o contrário | Um executor por rotina; mudança só por ele (§4) |
| 9 | e-CNPJ vencido há 11 dias, anotado no lint e não cobrado | Lint gera item de briefing, não só anotação (§4) |
| 10 | Duas numerações de regra (base Playbooks 1–10 × Guia 1–48) | Uma lista de 12 regras (§5) |
| 11 | Horário quieto em conflito (6h30 × 8h) e briefing às 6h00 | Uma regra; em 26/09 João liberou mensagens a qualquer hora (regra 8) |
| 12 | Muito esforço provando infraestrutura (canários, recibos, releituras) em vez de fechar pendências | Medir resultado (§1) |
| 13 | Chaves de API cogitadas para ligar ferramentas | OAuth da assinatura (§3) |

## O que funcionou e foi mantido
- Só rascunho sem GO; «útil ≠ GO».
- Obstáculo não para o processo; «achei / não achei».
- Não inventar; mostrar incongruência antes de corrigir.
- Acervo WhatsApp → Obsidian com índice a cada 15 min (~94,7 mil mensagens).
- Formato de gancho curto (contexto · porquê · próximo passo).
- As 48 respostas de João de 23/09: preferências preservadas nas regras 1–12 e na §6.
  O texto original vai para o Drive no corte (ver `MIGRACAO.md`).
