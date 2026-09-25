import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");

app.use(express.json({ limit: "25mb" }));

const instructions = `
Você interpreta a personagem Ana, da EcoFazenda Virtual.

CONTEXTO DA EXPERIÊNCIA:
O visitante acabou de concluir uma exploração gamificada da EcoFazenda em um ambiente 3D no Roblox.
Agora ele chegou à horta da EcoFazenda para conversar com você.
Você é uma mulher cientista que vive na fazenda e ajuda o visitante a relacionar o que observou com práticas sustentáveis.

TEMA PRINCIPAL:
SUSTENTABILIDADE.

Converse sobre assuntos ligados à experiência da EcoFazenda, incluindo economia e uso consciente da água,
economia de energia, energia solar e energia limpa, produção de alimentos, horta, agricultura sustentável,
compostagem, manejo e cuidado com o solo, reciclagem, resíduos, poluição, biodiversidade,
preservação ambiental e consumo responsável.

Não invente características específicas da EcoFazenda que não tenham sido informadas pelo visitante.
Quando a pergunta depender de algo que ele viu no Roblox, peça que descreva brevemente o que encontrou.

PERSONALIDADE:
Ana é simpática, acolhedora, curiosa e comunicativa.
Fale de forma simples e natural, como em uma conversa presencial na horta.
Você pode explicar conceitos científicos, mas sem transformar respostas simples em uma aula longa.

RESPOSTAS:
Responda sempre em português do Brasil.
Prefira 1 a 3 frases curtas, adequadas para serem faladas em voz alta.
Não use listas, Markdown, hashtags ou títulos.
Não repita a pergunta do visitante.
Quando fizer sentido, faça uma pergunta curta para continuar a conversa.

Se perguntarem algo fora do tema, responda de modo simpático que seu papel na EcoFazenda é conversar sobre sustentabilidade e meio ambiente, e conduza o assunto de volta.
Se perguntarem quem você é, diga naturalmente que você é Ana, cientista da EcoFazenda Virtual, e que está ali para conversar sobre a experiência e sustentabilidade.
Mantenha a personagem Ana durante toda a conversa.
`;


function esperar(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function erroTemporarioGemini(error) {
  return error?.status === 503 || error?.code === 503 || /503|UNAVAILABLE|high demand/i.test(String(error?.message || error || ''));
}

async function comRetryGemini(nome, operacao, maxTentativas = 3) {
  let ultimoErro;
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      if (tentativa > 1) console.log(`[QUEST] ${nome}: tentativa ${tentativa}/${maxTentativas}`);
      return await operacao();
    } catch (error) {
      ultimoErro = error;
      if (!erroTemporarioGemini(error) || tentativa === maxTentativas) throw error;
      const espera = tentativa === 1 ? 1200 : 2500;
      console.warn(`[QUEST] ${nome}: Gemini ocupado (503). Nova tentativa em ${espera} ms...`);
      await esperar(espera);
    }
  }
  throw ultimoErro;
}

function makeInput(messages) {
  const clean = messages.slice(-20);

  return clean.map((m) => ({
    type: m.role === "assistant" ? "model_output" : "user_input",
    content: [{ type: "text", text: String(m.content || "") }]
  }));
}



// Converte PCM 24 kHz / mono / 16-bit em WAV reproduzível pelo navegador do Quest.
function pcmParaWav(pcm) {
  const header = Buffer.alloc(44);
  const sampleRate = 24000;
  const channels = 1;
  const bits = 16;
  const byteRate = sampleRate * channels * bits / 8;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * bits / 8, 32);
  header.writeUInt16LE(bits, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

app.post('/api/transcrever', async (req, res) => {
  console.log('[QUEST] áudio recebido no servidor');
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY não configurada.');
    const { audioBase64, mimeType = 'audio/webm' } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: 'Áudio não recebido.' });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await comRetryGemini('transcrição', () => ai.models.generateContent({
      model: process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [
        { text: 'Transcreva exatamente a fala deste áudio em português do Brasil. Retorne somente o texto falado, sem comentários. Se não houver fala compreensível, retorne vazio.' },
        { inlineData: { mimeType, data: audioBase64 } }
      ] }]
    }));
    const texto = (response.text || '').trim();
    console.log('[QUEST] transcrição:', texto || '(vazia)');
    res.json({ texto });
  } catch (error) {
    console.error('Erro transcrição:', error);
    res.status(500).json({ error: error?.message || 'Falha ao transcrever áudio.' });
  }
});

app.post('/api/tts', async (req, res) => {
  console.log('[QUEST] pedido TTS recebido');
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY não configurada.');
    const texto = String(req.body?.texto || '').trim();
    if (!texto) return res.status(400).json({ error: 'Texto não recebido.' });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await comRetryGemini('TTS', () => ai.models.generateContent({
      model: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Fale em português do Brasil, com voz feminina acolhedora, natural e clara, como a cientista Ana conversando presencialmente com um estudante em uma horta. Leia exatamente este texto, sem acrescentar nada: ${texto}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          languageCode: 'pt-BR',
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    }));
    const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData?.data;
    if (!data) throw new Error('O Gemini não retornou áudio.');
    const wav = pcmParaWav(Buffer.from(data, 'base64'));
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wav.length);
    console.log('[QUEST] TTS pronto:', wav.length, 'bytes');
    res.send(wav);
  } catch (error) {
    console.error('Erro TTS:', error);
    res.status(500).json({ error: error?.message || 'Falha ao gerar voz.' });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não configurada no arquivo .env"
      });
    }

    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];

    if (!messages.length) {
      return res.status(400).json({ error: "Nenhuma mensagem enviada" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: "v1" }
    });

    console.time("TEMPO GEMINI");

const stream = await ai.interactions.create({
  model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  input: makeInput(messages),
  system_instruction: instructions,

  generation_config: {
    thinking_level: "minimal"
  },

  stream: true
});

let answer = "";
let primeiroPedaco = false;

for await (const event of stream) {
  if (
    event.event_type === "step.delta" &&
    event.delta?.type === "text"
  ) {
    if (!primeiroPedaco) {
      console.timeEnd("TEMPO GEMINI");
      primeiroPedaco = true;
    }

    answer += event.delta.text;
  }
}

console.log("RESPOSTA ANA:", answer);

    

    

    

    

    if (!answer) {
      throw new Error("O Gemini não retornou texto.");
    }

    res.json({ answer });
  } catch (error) {
    console.error("Erro Gemini:", error);
    res.status(500).json({
      error: error?.message || "Falha ao consultar o Gemini"
    });
  }
});

// Em produção (Render), o mesmo servidor Node entrega o frontend Vite.
// As rotas /api acima continuam sendo atendidas pelo Express no mesmo domínio HTTPS.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(dist));

  // Fallback SPA compatível com Express 5.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/") || req.path === "/live") {
      return next();
    }
    res.sendFile(path.join(dist, "index.html"));
  });
}

const server = app.listen(port, () => {
  console.log(`Ana com Gemini em http://localhost:${port}`);
});

const wss = new WebSocketServer({
  server,
  path: "/live"
});

wss.on("connection", async (ws) => {
  console.log("🌐 Navegador conectado ao servidor Live");

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",

      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {}
      },

      callbacks: {
        onopen: () => {
          console.log("✅ Servidor conectado ao Gemini Live");

          ws.send(JSON.stringify({
            type: "status",
            message: "Gemini Live conectado"
          }));
        },

        onmessage: (message) => {
          const content = message.serverContent;

          if (content?.outputTranscription?.text) {
            ws.send(JSON.stringify({
              type: "transcription",
              text: content.outputTranscription.text
            }));
          }

          if (content?.turnComplete) {
            ws.send(JSON.stringify({
              type: "turnComplete"
            }));
          }
        },

        onerror: (erro) => {
          console.error("❌ Gemini Live:", erro.message);
        },

        onclose: () => {
          console.log("Gemini Live desconectado");
        }
      }
    });

    ws.on("message", (data) => {
      try {
        const mensagem = JSON.parse(data.toString());

        if (mensagem.type === "text") {
          console.log("👤 Visitante:", mensagem.text);

          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: mensagem.text
                  }
                ]
              }
            ],
            turnComplete: true
          });
        }
      } catch (erro) {
        console.error("Erro WebSocket:", erro);
      }
    });

    ws.on("close", () => {
      console.log("🌐 Navegador desconectado");

      try {
        session.close();
      } catch {}
    });

  } catch (erro) {
    console.error("Erro ao criar Gemini Live:", erro);
  }
});
