// Arte pintada no Higgsfield (ver design/assets.csv e docs/PROMPTS.md).
// Cada fase carrega seu horizonte com fallback procedural se offline.
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p';
// vistas pintadas épicas (estilo "Terra-média" aprovado): mundo colossal
// visto por heróis minúsculos. Dia natural, céu azul, luz dourada.
export const ART = {
  capim: `${CDN}/hf_20260717_212247_6c82296e-35bb-4f48-b7fc-2f51cbaacf47.png`,    // fases 5 e 9
  floresta: `${CDN}/hf_20260717_212251_f6bd2ede-eab2-4357-9cbe-c6e3068ae824.png`, // fase 4
  rio: `${CDN}/hf_20260717_212256_55affff5-9f4c-4f48-a4da-754f5aa1f5e8.png`,      // fase 8
  mirmecia: `${CDN}/hf_20260717_212259_961cf920-85be-4fee-bba1-dc44b0439144.png`, // fase 10
};

// malhas 3D dos heróis geradas no Higgsfield (image_to_3d, rig+anim).
// Vazio = usa o herói procedural. Preenchido conforme cada GLB fica pronto.
export const HERO_GLB = {
  1: 'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/a47b8c53-8cdd-4cb9-8a25-964a90becaf4.glb', // Tarso
  2: 'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/437d911b-68ee-4449-85e5-6db7f438d0ed.glb', // Brio
  3: 'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/ee6cdea4-c06a-4bcf-933b-1f3e82d385c0.glb', // Tino
  4: 'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/4daf9426-a2c3-447f-804d-4eeab6225283.glb', // Garra
  5: 'https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/eee48acd-45f0-49a3-8f2c-38ab56a34d64.glb', // Ávio
};

