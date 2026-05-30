# Missão LOCAL 1 — validação read-only (rodar no Mac Mini)

> Cole no `claude` local do Mac Mini. Pequena, READ_ONLY, para validar o loop antes da
> auditoria grande. Sem Drive. Codex valida o resultado.

```text
Modo: AUDITORIA READ_ONLY no Mac Mini. Gates duros: nao escrever em /Users/bonaos/wiki/wiki
(wiki compilada); sem credenciais; sem mensagem externa; sem comando destrutivo. So leitura
e 1 raw package nesta run.

Tarefa (somente leitura):
1. Liste o topo de /Users/bonaos/wiki (esperado: raw, wiki, control, Interface-Humana).
2. Confirme se existem: README.md, wiki/index.md, wiki/00-soul/SOUL.md, wiki/00-soul/IDENTITY.md.
3. Teste read-only do grafo nativo:
   python3 /Users/bonaos/.openclaw/workspace/scripts/wiki_native_graph.py query "parte claude code" 2>&1 | head -20
4. Produza um mapa de ate 15 linhas: o que existe / o que falta / 1 observacao.

Fechamento (obrigatorio):
- Crie raw package em /Users/bonaos/wiki/raw/inbox/Codex-mini/<run-id>/ com:
  result.md, receipt.md (objetivo, comandos rodados, achados, status keep/discard), SHA256SUMS.
- Nao promova nada a wiki. Imprima o caminho do raw package ao final.

Criterio de sucesso: nenhuma escrita fora do raw package; receipt + checksum presentes; mapa coerente.
```
