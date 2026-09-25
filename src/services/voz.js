let vozFeminina = null;

function carregarVozes() {
  return new Promise((resolve) => {
    const vozesAtuais = speechSynthesis.getVoices();

    if (vozesAtuais.length > 0) {
      resolve(vozesAtuais);
      return;
    }

    const timeout = setTimeout(() => {
      resolve(speechSynthesis.getVoices());
    }, 1500);

    speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(speechSynthesis.getVoices());
    };
  });
}

async function escolherVozFeminina() {
  if (vozFeminina) {
    return vozFeminina;
  }

  const vozes = await carregarVozes();

  const vozesPtBR = vozes.filter((voz) => {
    return (voz.lang || "").toLowerCase().includes("pt-br");
  });

  // Prioridade para vozes femininas conhecidas
  const nomesFemininos = [
    "francisca",
    "maria",
    "leticia",
    "letícia",
    "giovanna",
    "luciana",
    "brenda",
    "female",
    "feminina"
  ];

  for (const nome of nomesFemininos) {
    const encontrada = vozesPtBR.find((voz) =>
      voz.name.toLowerCase().includes(nome)
    );

    if (encontrada) {
      vozFeminina = encontrada;

      console.log(
        "Voz escolhida para Ana:",
        vozFeminina.name,
        vozFeminina.lang
      );

      return vozFeminina;
    }
  }

  // O Google Português do Brasil normalmente é feminino
  const googleBR = vozesPtBR.find((voz) =>
    voz.name.toLowerCase().includes("google")
  );

  if (googleBR) {
    vozFeminina = googleBR;

    console.log(
      "Voz escolhida para Ana:",
      vozFeminina.name,
      vozFeminina.lang
    );

    return vozFeminina;
  }

  // Última tentativa
  vozFeminina = vozesPtBR[0] || vozes[0] || null;

  if (vozFeminina) {
    console.log(
      "Voz escolhida para Ana:",
      vozFeminina.name,
      vozFeminina.lang
    );
  }

  return vozFeminina;
}

export function reconhecerFala({
  onStart,
  onResult,
  onEnd,
  onError
}) {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.(
      "Seu navegador não oferece reconhecimento de voz."
    );

    return null;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const texto =
      event.results?.[0]?.[0]?.transcript?.trim() || "";

    if (texto) {
      onResult?.(texto);
    }
  };

  recognition.onerror = (event) => {
    /*
      Ignoramos alguns erros normais durante
      uma conversa contínua.
    */
    if (
      event.error === "no-speech" ||
      event.error === "aborted"
    ) {
      return;
    }

    onError?.(
      `Erro no microfone: ${event.error || "desconhecido"}`
    );
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();

  return recognition;
}

export async function falarTexto(
  texto,
  {
    onStart,
    onEnd,
    onError
  } = {}
) {
  if (!("speechSynthesis" in window)) {
    onError?.(
      "Seu navegador não oferece síntese de voz."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const voz = await escolherVozFeminina();

  const fala = new SpeechSynthesisUtterance(texto);

  fala.lang = "pt-BR";

  // Voz da Ana
  fala.rate = 0.96;
  fala.pitch = 1.08;
  fala.volume = 1;

  if (voz) {
    fala.voice = voz;
  }

  fala.onstart = () => {
    onStart?.();
  };

  fala.onend = () => {
    onEnd?.();
  };

  fala.onerror = (event) => {
    if (event.error === "interrupted") {
      return;
    }

    onError?.(
      "Não foi possível reproduzir a voz da Ana."
    );
  };

  window.speechSynthesis.speak(fala);
}