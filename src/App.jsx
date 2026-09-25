import { useEffect, useRef, useState } from "react";

import Fazenda3D from "./components/Fazenda3D";

import {
  perguntarParaAna
} from "./services/chat";

import {
  falarTexto,
  reconhecerFala
} from "./services/voz";

import {
  prepararAudioQuest,
  falarTextoQuest,
  ouvirUmaFalaQuest,
  pararAudioQuest,
  definirDiagnosticoQuest
} from "./services/vozQuest";


export default function App() {

  const [messages, setMessages] = useState([]);

  const [status, setStatus] =
    useState("Ana pronta para conversar");

  const [ouvindo, setOuvindo] =
    useState(false);

  const [falando, setFalando] =
    useState(false);

  const [processando, setProcessando] =
    useState(false);

  const [conversaAtiva, setConversaAtiva] =
    useState(false);

  const [ultimaPergunta, setUltimaPergunta] =
    useState("");

  const [diagnosticoVR, setDiagnosticoVR] = useState("Aguardando entrada no VR");

  const [ultimaResposta, setUltimaResposta] =
    useState(
      "Olá! Eu sou a Ana. Vamos conversar sobre o que você conheceu na EcoFazenda."
    );


  /*
    REFERÊNCIAS
  */

  const recognitionRef = useRef(null);

  const conversaAtivaRef = useRef(false);

  const ocupadoRef = useRef(false);

  const messagesRef = useRef([]);

  const modoVRRef = useRef(false);

  useEffect(() => {
    definirDiagnosticoQuest(setDiagnosticoVR);
    return () => definirDiagnosticoQuest(null);
  }, []);


  /*
    INICIAR ESCUTA
  */

  function iniciarEscutaAutomatica() {

    if (!conversaAtivaRef.current) {
      return;
    }

    if (ocupadoRef.current) {
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    const reconhecer = modoVRRef.current ? ouvirUmaFalaQuest : reconhecerFala;

    recognitionRef.current =
      reconhecer({

        onStart: () => {

          setOuvindo(true);

          setStatus(
            "Ana está ouvindo você..."
          );

        },


        onResult: (texto) => {

          setOuvindo(false);

          enviarPergunta(texto);

        },


        onEnd: () => {

          setOuvindo(false);

          recognitionRef.current = null;


          /*
            Se ninguém falou,
            volta a ouvir automaticamente.
          */

          if (
            conversaAtivaRef.current &&
            !ocupadoRef.current
          ) {

            setTimeout(() => {

              iniciarEscutaAutomatica();

            }, 700);

          }

        },


        onError: (mensagem) => {

          recognitionRef.current = null;

          setOuvindo(false);

          console.log(mensagem);


          if (
            conversaAtivaRef.current &&
            !ocupadoRef.current
          ) {

            setTimeout(() => {

              iniciarEscutaAutomatica();

            }, 1000);

          }

        }

      });

  }


  /*
    ENVIAR PARA GEMINI
  */

  async function enviarPergunta(texto) {

    const pergunta =
      texto.trim();


    if (!pergunta) {
      return;
    }


    ocupadoRef.current = true;

    setProcessando(true);

    setUltimaPergunta(pergunta);

    setStatus(
      "Ana está pensando..."
    );


    const novasMensagens = [

      ...messagesRef.current,

      {
        role: "user",
        content: pergunta
      }

    ];


    messagesRef.current =
      novasMensagens;

    setMessages(
      novasMensagens
    );


    try {

      const resposta =
        await perguntarParaAna(
          novasMensagens
        );


      const atualizadas = [

        ...novasMensagens,

        {
          role: "assistant",
          content: resposta
        }

      ];


      messagesRef.current =
        atualizadas;

      setMessages(
        atualizadas
      );


      setUltimaResposta(
        resposta
      );


      setProcessando(false);

      setStatus(
        "Ana vai responder..."
      );


      /*
        ANA FALA
      */

      const falar = modoVRRef.current ? falarTextoQuest : falarTexto;

      falar(
        resposta,
        {

          onStart: () => {

            setFalando(true);

            setStatus(
              "Ana está falando..."
            );

          },


          onEnd: () => {

            setFalando(false);

            ocupadoRef.current =
              false;


            /*
              VOLTA A OUVIR SOZINHA
            */

            if (
              conversaAtivaRef.current
            ) {

              setStatus(
                "Pode falar..."
              );


              setTimeout(() => {

                iniciarEscutaAutomatica();

              }, 700);

            }

          },


          onError: (mensagem) => {

            setFalando(false);

            ocupadoRef.current =
              false;

            setStatus(
              mensagem
            );


            if (
              conversaAtivaRef.current
            ) {

              setTimeout(() => {

                iniciarEscutaAutomatica();

              }, 700);

            }

          }

        }
      );

    }

    catch (erro) {

      console.error(
        erro
      );

      ocupadoRef.current =
        false;

      setProcessando(false);

      setStatus(
        erro.message
      );


      if (
        conversaAtivaRef.current
      ) {

        setTimeout(() => {

          iniciarEscutaAutomatica();

        }, 1000);

      }

    }

  }


  /*
    COMEÇAR CONVERSA
  */

  function iniciarConversa() {

  // Evita iniciar duas conversas ao mesmo tempo
  if (conversaAtivaRef.current) {
    return;
  }

  conversaAtivaRef.current = true;

  setConversaAtiva(true);

  ocupadoRef.current = true;

  const saudacao =
    "Olá! Que bom encontrar você aqui na horta da EcoFazenda! " +
    "Eu sou a Ana. Agora que você terminou sua visita, podemos conversar sobre água, energia, " +
    "reciclagem, compostagem, produção de alimentos e tudo o que você conheceu pelo caminho.";

  setUltimaResposta(saudacao);

  setStatus("Ana está falando...");

  const falar = modoVRRef.current ? falarTextoQuest : falarTexto;

  falar(
    saudacao,
    {

      onStart: () => {

        setFalando(true);

        setStatus(
          "Ana está falando..."
        );

      },

      onEnd: () => {

        setFalando(false);

        ocupadoRef.current = false;

        setStatus(
          "Pode falar comigo..."
        );

        // Depois da saudação,
        // Ana começa a ouvir automaticamente
        setTimeout(() => {

          iniciarEscutaAutomatica();

        }, 600);

      },

      onError: (mensagem) => {

        console.log(mensagem);

        setFalando(false);

        ocupadoRef.current = false;

        setStatus(
          "Pode falar comigo..."
        );

        setTimeout(() => {

          iniciarEscutaAutomatica();

        }, 600);

      }

    }
  );

}


  async function iniciarConversaVR() {
    if (conversaAtivaRef.current) return;
    try {
      setStatus("Liberando microfone e áudio do Quest...");
      setDiagnosticoVR("Preparando áudio do Quest...");
      await prepararAudioQuest();
      modoVRRef.current = true;
      iniciarConversa();
    } catch (erro) {
      console.error(erro);
      setStatus("Permita o uso do microfone no navegador do Quest.");
      throw erro;
    }
  }

  /*
    ENCERRAR CONVERSA
  */

  function encerrarConversa() {

    conversaAtivaRef.current =
      false;

    ocupadoRef.current =
      false;


    setConversaAtiva(
      false
    );

    setOuvindo(
      false
    );

    setFalando(
      false
    );

    setProcessando(
      false
    );


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      }

      catch {

      }

      recognitionRef.current =
        null;

    }


    window.speechSynthesis?.cancel();
    pararAudioQuest();
    modoVRRef.current = false;


    setStatus(
      "Conversa encerrada"
    );

  }


  /*
    INTERFACE
  */

  return (

    <main className="app">


      <header className="topbar">

        <div>

          <span className="eyebrow">
            ECOFAZENDA VIRTUAL • ETAPA ANA
          </span>

          <h1>
            Ana
          </h1>

          <p>
            Depois da experiência no Roblox, converse com Ana na horta da EcoFazenda.
          </p>

        </div>


        <div className="status">

          <span
            className={
              `status-dot ${
                ouvindo
                  ? "listening"
                  : ""
              }`
            }
          />

          {status}

        </div>

      </header>


      <section className="scene-card">

        <Fazenda3D
  falando={falando}
  iniciarConversa={iniciarConversa}
  iniciarConversaVR={iniciarConversaVR}
  diagnosticoVR={diagnosticoVR}
/>

      </section>


      <section className="conversation-card">


        <div className="dialogue">


          <div>

            <span className="dialogue-label">
              Você
            </span>

            <p>

              {
                ultimaPergunta ||
                "Inicie a conversa e fale naturalmente."
              }

            </p>

          </div>


          <div>

            <span className="dialogue-label">
              Ana
            </span>

            <p>
              {ultimaResposta}
            </p>

          </div>


        </div>


        {!conversaAtiva ? (

          <button
            type="button"
            className="mic-button"
            onClick={
              iniciarConversa
            }
          >

            🎤 Iniciar conversa

          </button>

        ) : (

          <button
            type="button"
            className="mic-button active"
            onClick={
              encerrarConversa
            }
          >

            ⏹ Encerrar conversa

          </button>

        )}


      </section>


    </main>

  );

}