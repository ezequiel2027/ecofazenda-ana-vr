ECOFAZENDA ANA - V6 QUEST

Objetivo desta versão:
- preservar posição/cenário e TTS da V5
- corrigir a captura de microfone no Quest 2

Mudança principal:
A gravação no Quest agora usa uma janela fixa de 7 segundos, sem detector de silêncio via AudioContext.
Isso evita o ponto em que a V5 parava antes de enviar o áudio ao servidor.

Teste:
1. npm install
2. npm run dev
3. Abra o endereço HTTPS Network no Quest
4. Entre em VR
5. Depois da saudação, quando o painel mostrar GRAVANDO POR 7s — FALE AGORA, faça uma pergunta.
6. Aguarde. O painel deve mostrar Gravação encerrada, Enviando áudio, Entendido...

No PowerShell devem aparecer:
[QUEST] áudio recebido no servidor
[QUEST] transcrição: ...
