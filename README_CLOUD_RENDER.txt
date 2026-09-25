ECOFAZENDA ANA VR — CLOUD v1 (Render)
=====================================

OBJETIVO
Publicar a mesma aplicação React/Vite + Node/Express em um único endereço HTTPS.
O Quest acessará esse endereço público; /api/chat, /api/transcrever e /api/tts ficam no mesmo domínio.

IMPORTANTE
- O arquivo .env real NÃO está neste pacote e NÃO deve ir para o GitHub.
- A chave GEMINI_API_KEY deve ser cadastrada no painel Environment do Render.
- O frontend já usa URLs relativas (/api/...), portanto não precisa de localhost:3000 em produção.

GITHUB
1. Extraia este ZIP.
2. Entre na pasta ana-fazenda-3d-gemini.
3. Envie os arquivos para um repositório GitHub.
4. Confirme que .env NÃO foi enviado. O .gitignore já contém .env.

RENDER — WEB SERVICE
- Runtime: Node
- Build Command: npm install && npm run build
- Start Command: npm start
- Environment variable: GEMINI_API_KEY = sua chave real
- Environment variable: GEMINI_MODEL = gemini-3.5-flash-lite
- Environment variable: NODE_ENV = production
- Não cadastre PORT manualmente no Render; o Render fornece essa variável.

TESTE
Depois do deploy, abra primeiro a URL HTTPS do Render no computador.
Teste a Ana. Depois abra exatamente a mesma URL no Meta Quest Browser e entre no VR.

VERSÃO
Esta versão altera apenas a preparação para nuvem. A lógica de conversa/Quest do ZIP recebido foi preservada.
