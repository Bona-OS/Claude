// Pipeline de pixelização estilo Final Fantasy V:
// cena → WebGLRenderTarget 480×270 (nearest) → quad fullscreen com
// quantização para paleta de 32 cores + dithering Bayer 4×4.
// O canvas fica em 480×270 e o CSS estica com image-rendering: pixelated.

import * as THREE from 'three';

export const PIXEL_W = 480;
export const PIXEL_H = 270;

// paleta FFV-like calibrada para o jogo: ferrugem, pôr do sol, capim,
// prata da armadura, azuis de menu/água, acentos de pétala
const PALETTE = [
  // sombras / terra
  '#1a0e06', '#2c1d11', '#3a2410', '#4a2f1b',
  // ferrugem
  '#5e2715', '#6e2c16', '#8a3b22', '#a64b2a', '#c2602f',
  // ouro / céu do entardecer
  '#d9863f', '#e8945a', '#f0b46a', '#e9bc7e', '#f3e9d2',
  // verdes do capim
  '#24350f', '#2e5419', '#3d6b23', '#4f7d2a', '#6fa03a', '#9bc25e',
  // pratas (papel-alumínio)
  '#56575e', '#83858f', '#aeb0bb', '#dcdce6', '#f2f2fa',
  // azuis (menu FFV / água / noite)
  '#16203a', '#274b8a', '#3a6fd8', '#69a0f0', '#a8c8f8',
  // acentos
  '#c0392b', '#e07a9a',
];

const frag = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec3 uPalette[${PALETTE.length}];
  varying vec2 vUv;

  // Bayer 4x4 compacto (0..1)
  float Bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }

  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    vec2 px = gl_FragCoord.xy;
    float dither = Bayer2(0.5 * px) * 0.25 + Bayer2(px);
    c += (dither - 0.5) * 0.07; // perturbação pré-quantização

    float best = 1e9;
    vec3 bestC = uPalette[0];
    for (int i = 0; i < ${PALETTE.length}; i++) {
      vec3 d = c - uPalette[i];
      // distância ponderada pela percepção (verde pesa mais)
      float dist = dot(d * vec3(0.6, 1.0, 0.45), d);
      if (dist < best) { best = dist; bestC = uPalette[i]; }
    }
    gl_FragColor = vec4(bestC, 1.0);
  }
`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export class PixelPipeline {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this.renderer.setSize(PIXEL_W, PIXEL_H, false); // CSS faz o upscale
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // sombra dura = pixel
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.target = new THREE.WebGLRenderTarget(PIXEL_W, PIXEL_H, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
    });
    this.target.texture.colorSpace = THREE.SRGBColorSpace;

    const palette = PALETTE.map((hex) => {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    });

    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postMaterial = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: this.target.texture }, uPalette: { value: palette } },
      vertexShader: vert,
      fragmentShader: frag,
      depthTest: false,
      depthWrite: false,
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial));
    this.enabled = true; // P liga/desliga (debug/comparação)
  }

  render(scene, camera) {
    if (!this.enabled) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(scene, camera);
      return;
    }
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }
}
