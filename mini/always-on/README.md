# Remote Control permanente no Mini

**Sintoma:** depois de umas horas longe, as sessões do Mini aparecem no app como «em execução», mas
não respondem a prompt novo.

**Causa** (doc oficial, [Remote Control › Limitations](https://code.claude.com/docs/en/remote-control)):
o `claude remote-control` em modo servidor desiste depois de ~10 min sem rede ou com o Mac dormindo e
**sai sem reconectar**. Ninguém subia o processo de novo, então a sessão ficava órfã no app
(`computer_unreachable` em todas as sessões do Mini em 26–27/09). Duas agravantes: o macOS congela
processo de launchd quando o Mac fica ocioso, e o Mini podia dormir.

**Correção:** LaunchAgent `ai.bona.remote-control` com `KeepAlive` (caiu → sobe em ≤ 30 s),
`ProcessType=Interactive` (sem congelamento por ociosidade) e `caffeinate` (sem sono enquanto roda).
Reiniciado dentro de ~4 h, o servidor traz de volta as sessões que servia: voltar ao app = continuar
de onde parou. Sessões abertas à mão no terminal ganham `remoteControlAtStartup`, que reconecta sozinho.

## Instalar (no Mini, uma vez)
```bash
cd ~/Bona-OS/Claude && git pull origin main
mini/remote-control/instalar            # pasta padrão: ~/Bona-OS/Claude
```
👤 Depois, com senha: `sudo pmset -c sleep 0 womp 1 autorestart 1` e login automático do usuário
`bonaos` (LaunchAgent só roda com sessão aberta).

## Conferir e operar
```bash
launchctl print gui/$(id -u)/ai.bona.remote-control | grep -E 'state|pid'
tail -f ~/Library/Logs/bona/remote-control.log
launchctl kickstart -k gui/$(id -u)/ai.bona.remote-control   # forçar reinício
mini/remote-control/instalar --remover                       # desfazer
```
Sessão parada há mais de ~4 h não volta sozinha: abrir nova no app (mesma pasta, mesmo repo).
Sessão parada esperando aprovação aparece como «precisa de ação»: ligar em `/config` o
**Push when actions required** para receber aviso no celular.
