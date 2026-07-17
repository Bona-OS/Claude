// Arte pintada no Higgsfield (ver design/assets.csv e docs/PROMPTS.md).
// Cada fase carrega seu horizonte com fallback procedural se offline.
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p';
export const ART = {
  capim: `${CDN}/hf_20260613_013436_fe5a4252-aa99-4f12-b79f-cc132a80d550.jpeg`,    // fases 5 e 9
  floresta: `${CDN}/hf_20260613_013439_67bc2fed-86cd-462b-b073-917831e78583.jpeg`, // fase 4
  rio: `${CDN}/hf_20260613_013442_f02a91e5-a012-4537-9b1d-bb308798c534.png`,       // fase 8
  mirmecia: `${CDN}/hf_20260613_013445_a923f0f0-eceb-4240-9d77-3d84fb8dbda4.jpeg`, // fase 10
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

