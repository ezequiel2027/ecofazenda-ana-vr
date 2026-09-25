# EcoFazenda Virtual — Etapa Ana

Esta pasta é a segunda etapa da experiência da EcoFazenda Virtual.

Fluxo previsto:
1. O visitante conclui a experiência gamificada no Roblox.
2. Em seguida acessa esta etapa em navegador/Meta Quest.
3. A cena abre na horta da EcoFazenda.
4. Ao clicar em **Entrar em VR**, a sessão VR é iniciada e Ana faz a saudação automaticamente.
5. Depois da saudação, o reconhecimento de voz começa e a conversa continua de forma automática.
6. As perguntas são enviadas ao Gemini, que responde mantendo a personagem Ana e o tema sustentabilidade.

## Executar no Windows / PowerShell

Na pasta do projeto:

    npm install
    npm run dev

O terminal exibirá o servidor Node e o Vite. No computador, abra a URL HTTPS do Vite. No Quest 2, abra no navegador do óculos a URL HTTPS correspondente ao IP do computador na mesma rede.

## Gemini

O arquivo `.env` precisa conter:

    GEMINI_API_KEY=SUA_CHAVE
    GEMINI_MODEL=gemini-3.6-flash
    PORT=3000

## Observação

O navegador pode pedir permissão para usar o microfone. Ela deve ser concedida para a conversa por voz funcionar.
