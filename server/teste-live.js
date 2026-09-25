import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const model = "gemini-3.1-flash-live-preview";

async function testarLive() {
  console.log("Conectando ao Gemini Live...");

  const session = await ai.live.connect({
    model,

    callbacks: {
      onopen: () => {
        console.log("✅ Gemini Live conectado");
      },

      onmessage: (message) => {
  const content = message.serverContent;

  if (!content) return;

  if (content.outputTranscription?.text) {
    console.log("ANA:", content.outputTranscription.text);
  }

  if (content.turnComplete) {
    console.log("✅ Resposta concluída");
  }
},

      onerror: (erro) => {
        console.error("❌ Erro Gemini Live:", erro.message);
      },

      onclose: (evento) => {
        console.log("🔌 Gemini Live desconectado:", evento.reason);
      }
    },

    config: {
      responseModalities: [Modality.AUDIO]
    }
  });

  console.log("✅ Sessão Live criada");

  session.sendClientContent({
  turns: [
    {
      role: "user",
      parts: [
        {
          text: "Olá Ana, me explique em uma frase o que é energia solar."
        }
      ]
    }
  ],
  turnComplete: true
});

  return session;
}

testarLive().catch((erro) => {
  console.error("Erro ao iniciar:", erro);
});