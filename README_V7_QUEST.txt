ECOFAZENDA ANA - V7 QUEST ESTAVEL

Alterações desta versão:
- Mantém cenário e posição da Ana da v6.
- Mantém gravação fixa de 7 segundos que já chegou ao servidor no Quest.
- Transcrição Gemini agora tenta novamente automaticamente em erros temporários 503.
- TTS Gemini também tenta novamente automaticamente em erros temporários 503.
- Logs indicam cada nova tentativa no PowerShell.

TESTE:
1. npm install
2. npm run dev
3. Abra o endereço HTTPS Network no Quest.
4. Entre em VR.
5. Depois da fala da Ana, diga: "Ana, o que é sustentabilidade?"
6. Aguarde: se o Gemini estiver ocupado, o servidor fará até 3 tentativas automaticamente.
