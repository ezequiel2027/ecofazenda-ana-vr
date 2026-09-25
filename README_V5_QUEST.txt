EcoFazenda Ana Horta VR v5 - DIAGNOSTICO QUEST

Base de posição: v2/v3 (Ana a ~3 m, posição [0,0,-3], escala 0.46).
Esta versão acrescenta diagnóstico visível DENTRO do VR e logs [QUEST] no servidor.

Teste:
1. npm install
2. npm run dev
3. No Quest, abrir a URL HTTPS Network.
4. Permitir microfone.
5. Entrar em VR.
6. Ler o painel "VR:" que aparece à frente.
7. Depois da saudação, falar: "Ana, o que é sustentabilidade?"

Estados esperados:
- Solicitando microfone...
- Microfone autorizado
- Gerando voz da Ana...
- Voz da Ana reproduzindo
- Gravando: fale agora
- Gravação encerrada: N bytes
- Enviando áudio ao servidor...
- Entendido: ...

No PowerShell também aparecerão linhas [QUEST].
