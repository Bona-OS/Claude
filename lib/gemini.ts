import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export interface RestoreOptions {
  /** Coloriza fotos em preto e branco / sépia. */
  colorize?: boolean;
  /** Instruções extras do cliente (ex: "remover a pessoa do fundo"). */
  instructions?: string;
}

export interface RestoredImage {
  bytes: Buffer;
  mimeType: string;
}

function buildPrompt(opts: RestoreOptions): string {
  const parts: string[] = [
    "You are a world-class photo restoration artist.",
    "Restore this old, damaged or faded photograph with maximum realism:",
    "- Remove scratches, tears, creases, dust, stains and noise.",
    "- Plausibly reconstruct missing or torn regions.",
    "- Recover and sharpen facial detail naturally, WITHOUT changing identity.",
    "- Fix fading, exposure and color casts; rebalance contrast and tones.",
  ];
  if (opts.colorize) {
    parts.push(
      "- This photo is black & white or sepia: colorize it realistically with natural, period-accurate tones."
    );
  }
  parts.push(
    "Preserve the original composition, framing, people and authentic character.",
    "Do NOT add new people or objects, and do not stylize the result.",
    "Return only the restored image, at the highest resolution possible."
  );
  if (opts.instructions) parts.push(`Additional client instructions: ${opts.instructions}`);
  return parts.join("\n");
}

/**
 * Restaura uma foto usando o modelo de imagem do Gemini ("Nano Banana").
 * Recebe os bytes da imagem original e devolve os bytes da imagem restaurada.
 */
export async function restorePhoto(
  imageBytes: Buffer,
  mimeType: string,
  opts: RestoreOptions = {}
): Promise<RestoredImage> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(opts) },
          { inlineData: { mimeType, data: imageBytes.toString("base64") } },
        ],
      },
    ],
  });

  const parts = res.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      return {
        bytes: Buffer.from(inline.data, "base64"),
        mimeType: inline.mimeType || "image/png",
      };
    }
  }
  throw new Error("Gemini não retornou nenhuma imagem restaurada");
}
