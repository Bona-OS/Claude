# Migração: tirar a configuração de IA do Notion

A ordem importa: rotinas e perfis de bots apontam para IDs dessas páginas. Remover antes de
repontar quebra o que ainda roda.

## Passo 0 — Aprovação (João)
- [ ] Aprovar o `MANUAL.md` (ou pedir ajustes no PR).

## Passo 1 — Congelar (Grok normal ou CoS)
- [ ] Pausar as rotinas do Grokbot/CoS que escrevem em páginas de configuração: lint leve 12h30/16h30,
      lint de estrutura 20h50, lint de pendências 19h30, calibração 21h, feedback 09h, bypass do lint 19h.
- [ ] Manter no ar até o passo 3: briefing, radar de vencimentos e índice do Mini.

## Passo 2 — Guardar (sem apagar nada)
- [ ] Exportar as páginas da lista abaixo (Notion → Export → Markdown & CSV, com subpáginas) para o
      Drive: `Bona/Arquivo/config-v1-2026-09.zip`.
- [ ] Conferir se o arquivo abre antes de seguir.

## Passo 3 — Ligar a v0
- [ ] Instalar o executor no Mini (`mini/README.md`), via Computer Use do Codex ou Grok Build.
- [ ] Criar as 3 rotinas do Claude (briefing, radar, lint).
- [ ] Trocar o perfil de cada bot/assistente por uma linha só: «Configuração: repositório Bona-OS/Claude, `sistema/MANUAL.md`».
- [ ] Desligar as rotinas pausadas no passo 1.

## Passo 4 — Limpar o Notion
- [ ] Mover para a lixeira as páginas de configuração (lista abaixo). A lixeira as tira da busca
      dos agentes; «Arquivo — fora do núcleo» **não** tira.
- [ ] Base Frentes: tirar «Arquitetura de sistemas» e «Conectividade MCP». Antes, as 8 Ações ligadas
      à «Arquitetura de sistemas» precisam ser fechadas ou religadas a uma frente real.
- [ ] Pendências: converter «Frente» (texto) em **relação** com Frentes; criar as frentes que
      faltam (Volvo XC90, Família/Unimed, Contábil, Governança, Jurídico/Cícero, Mesa de
      Investimentos, CENI Participações, AMJ).
- [ ] Central: remover a seção «Gestão do Notion» e o atalho «Checklist da ponte Zap».

## Lista — configuração (vai para o export + lixeira)
Arquitetura Consigliere v2 · 📊 Arquitetura — o que montamos até agora · Arquitetura —
Grok mesa + CoS braço + Lint Notion · Arquitetura de sistemas (+ filha Integração das
plataformas) · Gestão do Notion (+ filhas: Playbooks dos Agentes, Entrevista 48, Lint diário —
gestão e logs, Calibração do Consigliere, Radar Consigliere — filtro, Bridge CoS ↔ Codex, MCP
Conectividade — Spec, Outbox João — DM Bona 1175, Lint de regras, Audit privado, Diário semanal,
Timeline) · base Playbooks (5 campos) · Playbooks — Ciclo de Documento · Grok Bot — mandato
operacional · Manter Central Notion · Spec — Ponte WhatsApp · Organização AntFarm · Ponte — canal
Grok ↔ Grok Bot · lint-diario (skill) · Arquivo — fora do núcleo (o que for configuração).

## Lista — dados (fica)
Central (sem a seção de gestão) · base Frentes (frentes reais) · Pendências · Ações ·
Compromissos · Livro-caixa · CRM · Pessoas/Referências · Áreas da Vida · páginas de entidade
(CENI Participações, Jesus e Cia, AMJ, Casa João e Vanessa, Reforma Geralda, Mesa de
Investimentos, Governança — visões) · Cérebro · Ler depois · Mapa do Drive (é inventário de dados).

## Em dúvida (João decide)
- **Diário semanal e Timeline:** são registros para João ler, não configuração. Proposta: o briefing
  passa a ser o diário, e as duas bases vão para o arquivo.
- **Entrevista 48:** o texto é de João. Proposta: exportar para o Drive; as preferências já estão no
  Manual.
