ECOFAZENDA ANA - v8 RÁPIDA

Base: v7 RETRY 503 estável.

Alteração desta etapa:
- Mantém a gravação máxima de 7 segundos como segurança.
- Detecta quando o visitante começa a falar.
- Após a fala, cerca de 850 ms de silêncio encerra a gravação e envia imediatamente.
- Limiar do microfone é ajustado automaticamente a partir do ruído ambiente inicial.
- Se o detector não estiver disponível no Quest, volta automaticamente ao comportamento seguro de 7 segundos.
- Mantidos os retries de erro 503 da v7.

TESTE:
1. npm install
2. npm run dev
3. Entre no VR.
4. Espere Ana terminar a saudação.
5. Faça uma pergunta curta e pare de falar.
6. Procure no diagnóstico: "Fala detectada" e "Fim da fala detectado — enviando agora".
