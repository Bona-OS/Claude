// Geração automática de peças de campanha (antes/depois) para redes sociais.
// O publicador real (Instagram/TikTok) exige tokens das APIs e entra como
// passo separado — aqui geramos o criativo, a legenda e as hashtags.

export interface CampaignAsset {
  caption: string;
  hashtags: string[];
  /** Prompt pronto pra gerar o criativo (imagem) do post. */
  creativePrompt: string;
}

const HASHTAGS = [
  "#restauracaodefotos",
  "#fotosantigas",
  "#memorias",
  "#anteseDepois",
  "#fotografia",
  "#familia",
  "#nostalgia",
  "#presente",
  "#recordacoes",
];

const HOOKS = [
  "✨ Olha essa transformação!",
  "😍 Devolvemos a vida pra essa lembrança:",
  "🕰️ De volta ao que era — e melhor:",
  "💛 Cada foto antiga guarda uma história. Veja só:",
];

/** Gera uma peça de campanha pronta a partir de um trabalho concluído. */
export function generateCampaignAsset(opts: { customerName?: string; seed?: number } = {}): CampaignAsset {
  const hook = HOOKS[(opts.seed ?? Date.now()) % HOOKS.length];
  const brand = process.env.NEXT_PUBLIC_BRAND || "FotoRestaura";
  const price = process.env.PRICE_BRL || "29";

  return {
    caption:
      `${hook}\n\n` +
      `Restauramos essa foto direto pelo WhatsApp, sem app e sem complicação. ` +
      `Tem uma foto antiga, rasgada ou desbotada guardada na gaveta? ` +
      `A ${brand} devolve ela como nova.\n\n` +
      `📲 Manda no WhatsApp e receba o "antes e depois". Primeira a partir de R$ ${price}.`,
    hashtags: HASHTAGS,
    creativePrompt:
      "Vertical 4:5 social-media creative: side-by-side BEFORE/AFTER of a restored old family photograph. " +
      "Clean modern layout, soft warm palette, bold 'ANTES' and 'DEPOIS' labels, subtle WhatsApp call-to-action badge.",
  };
}
