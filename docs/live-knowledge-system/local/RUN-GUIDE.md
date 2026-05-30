# Rodar 100% local no Mac Mini (sem Drive relay)

Você está no Mac Mini, então não precisa do relay. Ordem aprovada pelo Codex:
**1) validação read-only pequena → 2) auditoria /ultracode completa.**

## 1. Validação (read-only)
No Terminal do Mac:
```bash
claude              # abre sessao interativa
# cole o bloco de local-validation.md e rode
```
Ou não-interativo:
```bash
claude -p "$(cat docs/live-knowledge-system/local/local-validation.md | sed -n '/```text/,/```/p' | sed '1d;$d')"
```
Confira: raw package em `/Users/bonaos/wiki/raw/inbox/Codex-mini/<run-id>/` com `receipt.md` +
`SHA256SUMS`, e nenhuma escrita fora dele.

## 2. Auditoria /ultracode (após a validação passar)
```bash
claude              # sessao interativa
/ultracode          # habilita o modo dynamic workflows
# cole o bloco de local-ultracode-audit.md
```

## Direto pelo Codex (alternativa)
```bash
codex exec "Leia docs/.../local/local-validation.md, valide os gates READ_ONLY, rode no claude e feche o raw package"
```

## Lembretes (gates)
- READ_ONLY; nada de escrever em `/Users/bonaos/wiki/wiki`.
- Sem credenciais, mensagens externas ou comandos destrutivos.
- Promoção à wiki = **Hermes**, rota oficial (nunca direto).
