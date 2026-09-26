# Bona — sistema pessoal de Chief of Staff do João

Repositório de código e configuração do **Bona**: o sistema multiagente que recebe pedidos,
áudios, documentos e ideias do João e devolve trabalho útil, verificado e com continuidade.

> A FotoRestaura (restauração de fotos via WhatsApp) foi removida deste repositório em 26/09/2026.
> O código continua no histórico do git (commit `32f6965`).

## Fonte de verdade

O **estado** do sistema vive no Notion, não aqui. Este repositório guarda apenas o que é código,
configuração e protocolo.

| O quê | Onde |
|---|---|
| Arquitetura vigente | Notion › Gestão do Notion › *Arquitetura Consigliere v2* (`3e45edb2cfd581ae8400fc4933389962`) |
| Método de trabalho | Topo dos *Playbooks* + *Guia 48* (`3e65edb2cfd581f5a7c2e78268f85075`) |
| Discussão técnica e recibos | *Integração das plataformas* (`3d75edb2cfd5814eb6c8c8639ebe3b8b`) + Work Log |
| Originais | Google Drive (com SHA-256) |
| Histórico bruto | Acervo WhatsApp/WACLI → vault Obsidian |

## Conteúdo

- [`CLAUDE.md`](CLAUDE.md) — regras que toda sessão do Claude segue ao trabalhar para o Bona.
- [`docs/INTEGRACAO.md`](docs/INTEGRACAO.md) — como Grok, Grokbot e Claude se dividem e se conectam.
