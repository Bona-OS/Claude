#!/usr/bin/env node
/**
 * grok-media-mcp — servidor MCP (stdio) que expõe a geração de mídia da xAI:
 *
 *   - generate_image  → POST https://api.x.ai/v1/images/generations  (Grok Imagine)
 *   - generate_video  → POST https://api.x.ai/v1/videos/generations  (assíncrono, com polling)
 *   - generate_speech → POST https://api.x.ai/v1/tts                 (texto → fala)
 *
 * Autenticação: XAI_API_KEY (chave de API criada em https://console.x.ai).
 * IMPORTANTE: a assinatura SuperGrok/SuperGrok Heavy NÃO inclui acesso à API —
 * a API da xAI tem cobrança e créditos próprios.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_BASE = process.env.XAI_API_BASE ?? "https://api.x.ai/v1";
const OUTPUT_DIR =
  process.env.GROK_MEDIA_OUTPUT_DIR ?? path.join(process.cwd(), "grok-media-output");
const IMAGE_MODEL = process.env.XAI_IMAGE_MODEL ?? "grok-imagine-image-quality";
const VIDEO_MODEL = process.env.XAI_VIDEO_MODEL ?? "grok-imagine-video";
const VIDEO_POLL_INTERVAL_MS = 5_000;
const VIDEO_TIMEOUT_MS = Number(process.env.XAI_VIDEO_TIMEOUT_MS ?? 10 * 60_000);

function apiKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new Error(
      "XAI_API_KEY não definida. Crie uma chave em https://console.x.ai e exporte-a. " +
        "Atenção: a assinatura SuperGrok Heavy não dá acesso à API — os créditos de API são separados.",
    );
  }
  return key;
}

async function xaiRequest(endpoint: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`xAI API ${endpoint} → HTTP ${res.status}: ${body.slice(0, 2000)}`);
  }
  return res;
}

function timestampName(prefix: string, ext: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${ts}.${ext}`;
}

async function saveBytes(filename: string, bytes: Uint8Array): Promise<string> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, filename);
  await writeFile(filePath, bytes);
  return filePath;
}

async function downloadToFile(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
  return saveBytes(filename, new Uint8Array(await res.arrayBuffer()));
}

/** Aceita tanto base64 puro quanto data-URL ("data:image/png;base64,..."). */
function decodeB64(b64: string): Uint8Array {
  const comma = b64.indexOf(",");
  const raw = b64.startsWith("data:") && comma !== -1 ? b64.slice(comma + 1) : b64;
  return new Uint8Array(Buffer.from(raw, "base64"));
}

/** Procura uma URL de mídia nos formatos de resposta conhecidos da xAI. */
function findMediaUrl(obj: unknown): string | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  for (const key of ["url", "video_url"]) {
    if (typeof o[key] === "string") return o[key] as string;
  }
  for (const key of ["video", "data", "result", "output"]) {
    const nested = o[key];
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = findMediaUrl(item);
        if (found) return found;
      }
    } else {
      const found = findMediaUrl(nested);
      if (found) return found;
    }
  }
  return undefined;
}

const server = new McpServer({ name: "grok-media", version: "0.1.0" });

server.registerTool(
  "generate_image",
  {
    title: "Gerar imagem (Grok Imagine)",
    description:
      "Gera imagens com o Grok Imagine da xAI a partir de um prompt de texto. " +
      "Salva os arquivos em disco e retorna os caminhos.",
    inputSchema: {
      prompt: z.string().describe("Descrição da imagem a gerar"),
      n: z.number().int().min(1).max(10).default(1).describe("Quantidade de imagens (1-10)"),
      aspect_ratio: z
        .string()
        .optional()
        .describe('Proporção, ex.: "1:1", "16:9", "9:16" (opcional)'),
      model: z.string().optional().describe(`Modelo (padrão: ${IMAGE_MODEL})`),
    },
  },
  async ({ prompt, n, aspect_ratio, model }) => {
    const res = await xaiRequest("/images/generations", {
      method: "POST",
      body: JSON.stringify({
        model: model ?? IMAGE_MODEL,
        prompt,
        n,
        ...(aspect_ratio ? { aspect_ratio } : {}),
        response_format: "b64_json",
      }),
    });
    const json = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
    };
    const items = json.data ?? [];
    if (items.length === 0) {
      throw new Error(`Resposta sem imagens: ${JSON.stringify(json).slice(0, 1000)}`);
    }

    const lines: string[] = [];
    for (const [i, item] of items.entries()) {
      const filename = timestampName(`image-${i + 1}`, "png");
      let filePath: string;
      if (item.b64_json) {
        filePath = await saveBytes(filename, decodeB64(item.b64_json));
      } else if (item.url) {
        filePath = await downloadToFile(item.url, filename);
      } else {
        continue;
      }
      lines.push(filePath + (item.revised_prompt ? `\n  prompt revisado: ${item.revised_prompt}` : ""));
    }
    return {
      content: [
        { type: "text", text: `Imagens geradas (${lines.length}):\n${lines.join("\n")}` },
      ],
    };
  },
);

server.registerTool(
  "generate_video",
  {
    title: "Gerar vídeo (Grok Imagine)",
    description:
      "Gera um vídeo (com áudio nativo) usando o Grok Imagine da xAI. Suporta texto-para-vídeo " +
      "e imagem-para-vídeo (via image_url). A geração é assíncrona; a ferramenta aguarda a " +
      "conclusão e salva o arquivo em disco.",
    inputSchema: {
      prompt: z.string().describe("Descrição da cena/vídeo a gerar"),
      duration: z
        .number()
        .int()
        .min(1)
        .max(15)
        .optional()
        .describe("Duração em segundos (ex.: 6 ou 10)"),
      aspect_ratio: z.string().optional().describe('Proporção, ex.: "16:9", "9:16"'),
      resolution: z.string().optional().describe('Resolução, ex.: "720p"'),
      image_url: z
        .string()
        .optional()
        .describe("URL de uma imagem inicial para animar (imagem-para-vídeo)"),
      model: z.string().optional().describe(`Modelo (padrão: ${VIDEO_MODEL})`),
    },
  },
  async ({ prompt, duration, aspect_ratio, resolution, image_url, model }) => {
    const submit = await xaiRequest("/videos/generations", {
      method: "POST",
      body: JSON.stringify({
        model: model ?? VIDEO_MODEL,
        prompt,
        ...(duration ? { duration } : {}),
        ...(aspect_ratio ? { aspect_ratio } : {}),
        ...(resolution ? { resolution } : {}),
        ...(image_url ? { image_url } : {}),
      }),
    });
    const submitted = (await submit.json()) as { request_id?: string; id?: string };
    const requestId = submitted.request_id ?? submitted.id;
    if (!requestId) {
      throw new Error(`Resposta sem request_id: ${JSON.stringify(submitted).slice(0, 1000)}`);
    }

    const deadline = Date.now() + VIDEO_TIMEOUT_MS;
    let last: Record<string, unknown> = {};
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, VIDEO_POLL_INTERVAL_MS));
      const poll = await xaiRequest(`/videos/${requestId}`);
      last = (await poll.json()) as Record<string, unknown>;
      const status = String(last.status ?? "");
      if (status === "failed" || status === "expired") {
        throw new Error(`Geração de vídeo ${status}: ${JSON.stringify(last).slice(0, 1000)}`);
      }
      if (status === "done" || findMediaUrl(last)) {
        const url = findMediaUrl(last);
        if (!url) {
          throw new Error(
            `Vídeo pronto, mas sem URL na resposta: ${JSON.stringify(last).slice(0, 1000)}`,
          );
        }
        const filePath = await downloadToFile(url, timestampName("video", "mp4"));
        return {
          content: [
            { type: "text", text: `Vídeo gerado: ${filePath}\nrequest_id: ${requestId}` },
          ],
        };
      }
    }
    throw new Error(
      `Tempo esgotado (${VIDEO_TIMEOUT_MS / 1000}s) aguardando o vídeo ${requestId}. ` +
        `Último status: ${JSON.stringify(last).slice(0, 500)}`,
    );
  },
);

server.registerTool(
  "generate_speech",
  {
    title: "Gerar áudio/fala (xAI TTS)",
    description:
      "Converte texto em fala usando a API de TTS da xAI (vozes expressivas do Grok). " +
      "Salva o áudio em disco e retorna o caminho.",
    inputSchema: {
      text: z.string().describe("Texto a ser falado"),
      voice_id: z
        .string()
        .default("ara")
        .describe('Voz, ex.: "ara", "eve" (ou ID de voz clonada/customizada)'),
      language: z.string().default("en").describe('Idioma, ex.: "en", "pt"'),
      speed: z.number().min(0.5).max(2).optional().describe("Velocidade da fala (ex.: 1.2)"),
      codec: z.enum(["mp3", "wav"]).default("mp3").describe("Formato do arquivo de saída"),
    },
  },
  async ({ text, voice_id, language, speed, codec }) => {
    const res = await xaiRequest("/tts", {
      method: "POST",
      body: JSON.stringify({
        text,
        voice_id,
        language,
        ...(speed ? { speed } : {}),
        output_format: { codec },
      }),
    });
    const bytes = new Uint8Array(await res.arrayBuffer());
    const filePath = await saveBytes(timestampName("speech", codec), bytes);
    return { content: [{ type: "text", text: `Áudio gerado: ${filePath}` }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`grok-media-mcp pronto (saída em ${OUTPUT_DIR})`);
