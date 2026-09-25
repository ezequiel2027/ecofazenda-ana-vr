# Ana — Fazenda Sustentável 3D + Gemini

Versão 2 do projeto da Ana.

## Recursos já incluídos

- Ambiente 3D em React + Three.js.
- Personagem Ana em 3D.
- Fazenda com casa, árvores, plantação e placas solares.
- Botão "Falar com Ana".
- Reconhecimento de voz pelo navegador.
- Backend Node/Express.
- Integração com Gemini.
- Respostas curtas sobre sustentabilidade.
- Síntese de voz em português.
- Movimento simples da boca e do braço enquanto a Ana fala.

## 1. Instalar dependências

Abra o terminal na pasta do projeto:

```bash
npm install
```

## 2. Criar o arquivo .env

Copie o arquivo:

```text
.env.example
```

e renomeie a cópia para:

```text
.env
```

Depois coloque sua chave:

```text
GEMINI_API_KEY=SUA_CHAVE_AQUI
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

Se você já usa outro modelo Gemini que funciona na sua conta, pode alterar GEMINI_MODEL.

## 3. Executar

```bash
npm run dev
```

Esse comando abre:

- Backend em http://localhost:3000
- Frontend Vite em http://localhost:5173

Abra no Chrome ou Edge:

```text
http://localhost:5173
```

## 4. Testar a conversa

Clique em:

```text
Falar com Ana
```

Permita acesso ao microfone.

Pergunte, por exemplo:

```text
Ana, para que servem as placas solares?
```

## Observação sobre voz

Esta versão usa SpeechRecognition e SpeechSynthesis do navegador.

O reconhecimento de voz funciona melhor em navegadores baseados em Chromium.
A disponibilidade pode variar conforme navegador e sistema.

## Próxima etapa

A próxima versão será preparada para Meta Quest 2 com WebXR:

- botão Entrar em VR;
- câmera VR;
- controladores;
- Ana em tamanho real;
- interação dentro da fazenda.
