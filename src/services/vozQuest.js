let streamGlobal = null;
let audioAtual = null;
let audioContextGlobal = null;
let analyserGlobal = null;
let sourceGlobal = null;

let diagnosticoGlobal = () => {};
export function definirDiagnosticoQuest(fn) { diagnosticoGlobal = typeof fn === "function" ? fn : () => {}; }
function diag(msg) { console.log("[QUEST]", msg); diagnosticoGlobal(msg); }

export async function prepararAudioQuest() {
  // Mantém o AudioContext vivo: além de liberar o áudio no gesto do usuário,
  // ele é usado pela v8 para detectar quando a pessoa terminou de falar.
  diag("Solicitando microfone...");
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext && !audioContextGlobal) audioContextGlobal = new AudioContext();
  if (audioContextGlobal?.state === 'suspended') await audioContextGlobal.resume();

  if (!streamGlobal) {
    streamGlobal = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    diag("Microfone autorizado");
  }

  if (audioContextGlobal && !analyserGlobal) {
    analyserGlobal = audioContextGlobal.createAnalyser();
    analyserGlobal.fftSize = 1024;
    analyserGlobal.smoothingTimeConstant = 0.2;
    sourceGlobal = audioContextGlobal.createMediaStreamSource(streamGlobal);
    sourceGlobal.connect(analyserGlobal);
  }
  return streamGlobal;
}

export async function falarTextoQuest(texto, { onStart, onEnd, onError } = {}) {
  try {
    diag("Gerando voz da Ana...");
    if (audioAtual) { audioAtual.pause(); audioAtual = null; }
    const resposta = await fetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto })
    });
    if (!resposta.ok) {
      const e = await resposta.json().catch(() => ({}));
      throw new Error(e.error || 'Falha ao gerar a voz da Ana.');
    }
    const blob = await resposta.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioAtual = audio;
    audio.volume = 1;
    audio.onplay = () => onStart?.();
    audio.onended = () => { URL.revokeObjectURL(url); audioAtual = null; onEnd?.(); };
    audio.onerror = () => { URL.revokeObjectURL(url); audioAtual = null; onError?.('Não foi possível reproduzir a voz da Ana no Quest.'); };
    await audio.play();
    diag("Voz da Ana reproduzindo");
  } catch (e) {
    diag('Erro de áudio: ' + (e.message || 'desconhecido'));
    onError?.(e.message || 'Erro de áudio no Quest.');
  }
}

export async function ouvirUmaFalaQuest({ onStart, onResult, onEnd, onError }) {
  // v8: grava no máximo 7s, mas encerra cedo quando detecta fala seguida de silêncio.
  // Se o analisador do Quest não funcionar, o limite de 7s continua como fallback seguro.
  try {
    const stream = await prepararAudioQuest();
    const track = stream.getAudioTracks?.()[0];
    if (!track || track.readyState !== 'live') throw new Error('A faixa do microfone não está ativa no Quest.');

    const settings = track.getSettings?.() || {};
    diag(`Microfone ativo${settings.sampleRate ? ` • ${settings.sampleRate} Hz` : ''}`);

    const tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    const mimeType = tipos.find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const partes = [];
    let terminou = false;
    let timerMax = null;
    let rafId = null;
    let falaDetectada = false;
    let inicioFala = 0;
    let ultimoSom = 0;
    let amostrasRuido = [];
    let limiar = 0.025;
    const inicio = performance.now();

    const pararGravacao = (motivo) => {
      if (recorder.state !== 'recording') return;
      diag(motivo);
      recorder.stop();
    };

    recorder.ondataavailable = e => { if (e.data?.size) partes.push(e.data); };
    recorder.onerror = e => {
      clearTimeout(timerMax); if (rafId) cancelAnimationFrame(rafId);
      diag('Erro do MediaRecorder');
      onError?.(e?.error?.message || 'Erro ao gravar o microfone do Quest.');
    };

    recorder.onstop = async () => {
      if (terminou) return;
      terminou = true;
      clearTimeout(timerMax); if (rafId) cancelAnimationFrame(rafId);
      try {
        const blob = new Blob(partes, { type: recorder.mimeType || 'audio/webm' });
        diag('Gravação encerrada: ' + blob.size + ' bytes');
        if (blob.size < 500) { diag('Áudio vazio ou muito pequeno'); onEnd?.(); return; }

        const buffer = await blob.arrayBuffer();
        let bin = ''; const bytes = new Uint8Array(buffer); const passo = 0x8000;
        for (let i = 0; i < bytes.length; i += passo) bin += String.fromCharCode(...bytes.subarray(i, i + passo));

        diag('Enviando áudio ao servidor...');
        const r = await fetch('/api/transcrever', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: btoa(bin), mimeType: blob.type || 'audio/webm' })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Falha na transcrição.');
        const texto = data.texto?.trim();
        if (texto) { diag('Entendido: ' + texto); onResult?.(texto); }
        else { diag('Nenhuma fala compreendida'); onEnd?.(); }
      } catch (e) {
        diag('Erro de transcrição: ' + (e.message || 'desconhecido'));
        onError?.(e.message || 'Não consegui entender sua fala.');
      }
    };

    recorder.start(200);
    diag('OUVINDO — fale naturalmente');
    onStart?.();

    // Detector de fim de fala: mede o RMS do microfone.
    if (analyserGlobal && audioContextGlobal?.state === 'running') {
      const dados = new Float32Array(analyserGlobal.fftSize);
      const analisar = () => {
        if (recorder.state !== 'recording') return;
        analyserGlobal.getFloatTimeDomainData(dados);
        let soma = 0;
        for (let i = 0; i < dados.length; i++) soma += dados[i] * dados[i];
        const rms = Math.sqrt(soma / dados.length);
        const agora = performance.now();

        // Nos primeiros 450 ms mede o ruído ambiente para adaptar o limiar.
        if (agora - inicio < 450) {
          amostrasRuido.push(rms);
          const media = amostrasRuido.reduce((a, b) => a + b, 0) / amostrasRuido.length;
          limiar = Math.max(0.018, Math.min(0.08, media * 3.2));
        } else if (rms > limiar) {
          if (!falaDetectada) { falaDetectada = true; inicioFala = agora; diag('Fala detectada'); }
          ultimoSom = agora;
        }

        // Depois de pelo menos 500 ms de fala, 850 ms de silêncio encerra imediatamente.
        if (falaDetectada && agora - inicioFala > 500 && agora - ultimoSom > 850) {
          pararGravacao('Fim da fala detectado — enviando agora');
          return;
        }
        rafId = requestAnimationFrame(analisar);
      };
      rafId = requestAnimationFrame(analisar);
    } else {
      diag('Detector de silêncio indisponível — usando limite de segurança de 7s');
    }

    timerMax = setTimeout(() => pararGravacao('Limite de 7s atingido — enviando'), 7000);

    return { stop: () => { clearTimeout(timerMax); if (rafId) cancelAnimationFrame(rafId); pararGravacao('Gravação interrompida'); } };
  } catch (e) {
    diag('Falha no microfone: ' + (e.message || 'desconhecida'));
    onError?.(e.message || 'Não foi possível acessar o microfone do Quest.');
    return null;
  }
}

export function pararAudioQuest() {
  if (audioAtual) audioAtual.pause();
  audioAtual = null;
}
