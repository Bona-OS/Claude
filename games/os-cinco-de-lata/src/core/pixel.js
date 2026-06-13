// Pipeline de pixelização estilo Final Fantasy V "HD-2D":
// cena → RT 480×270 → bright-pass (240×135) → blur gaussiano H+V →
// composição com bloom → quantização para paleta de 32 cores + dithering
// Bayer 4×4. O canvas fica em 480×270 e o CSS estica pixelated.

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

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// extrai só o que brilha (luzes, emissivos, céu estourado)
const brightFrag = /* glsl */ `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(c * smoothstep(0.62, 0.9, lum), 1.0);
  }
`;

// gaussiano 9-tap separável
const blurFrag = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec2 uDir; // (1/w, 0) ou (0, 1/h)
  varying vec2 vUv;
  void main() {
    float w[5];
    w[0] = 0.227027; w[1] = 0.194594; w[2] = 0.121622; w[3] = 0.054054; w[4] = 0.016216;
    vec3 c = texture2D(tDiffuse, vUv).rgb * w[0];
    for (int i = 1; i < 5; i++) {
      c += texture2D(tDiffuse, vUv + uDir * float(i)).rgb * w[i];
      c += texture2D(tDiffuse, vUv - uDir * float(i)).rgb * w[i];
    }
    gl_FragColor = vec4(c, 1.0);
  }
`;

const quantFrag = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform sampler2D tBloom;
  uniform float uBloom;
  uniform vec3 uPalette[${PALETTE.length}];
  varying vec2 vUv;

  // Bayer 4x4 compacto (0..1)
  float Bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }

  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    c += texture2D(tBloom, vUv).rgb * uBloom; // a luz floresce ANTES da paleta
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

function quadScene(material) {
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  return scene;
}

export class PixelPipeline {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this.renderer.setSize(PIXEL_W, PIXEL_H, false); // CSS faz o upscale
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // sombra dura = pixel
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    const rt = (w, h) => {
      const t = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false,
      });
      t.texture.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    this.target = new THREE.WebGLRenderTarget(PIXEL_W, PIXEL_H, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
    });
    this.target.texture.colorSpace = THREE.SRGBColorSpace;
    const BW = PIXEL_W / 2, BH = PIXEL_H / 2;
    this.brightRT = rt(BW, BH);
    this.blurRT = rt(BW, BH);

    const palette = PALETTE.map((hex) => {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    });

    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.brightMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: this.target.texture } },
      vertexShader: vert, fragmentShader: brightFrag, depthTest: false, depthWrite: false,
    });
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
      vertexShader: vert, fragmentShader: blurFrag, depthTest: false, depthWrite: false,
    });
    this.quantMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.target.texture },
        tBloom: { value: this.brightRT.texture },
        uBloom: { value: 1.25 },
        uPalette: { value: palette },
      },
      vertexShader: vert, fragmentShader: quantFrag, depthTest: false, depthWrite: false,
    });
    this.brightScene = quadScene(this.brightMat);
    this.blurScene = quadScene(this.blurMat);
    this.quantScene = quadScene(this.quantMat);
    this.enabled = true; // P liga/desliga (debug/comparação)

    this._bw = BW; this._bh = BH;
  }

  render(scene, camera) {
    const r = this.renderer;
    if (!this.enabled) {
      r.setRenderTarget(null);
      r.render(scene, camera);
      return;
    }
    // 1. cena em 480×270
    r.setRenderTarget(this.target);
    r.render(scene, camera);
    // 2. bright-pass em meia resolução
    r.setRenderTarget(this.brightRT);
    r.render(this.brightScene, this.postCamera);
    // 3. blur H → blurRT, blur V → brightRT (vira o tBloom final)
    this.blurMat.uniforms.tDiffuse.value = this.brightRT.texture;
    this.blurMat.uniforms.uDir.value.set(1 / this._bw, 0);
    r.setRenderTarget(this.blurRT);
    r.render(this.blurScene, this.postCamera);
    this.blurMat.uniforms.tDiffuse.value = this.blurRT.texture;
    this.blurMat.uniforms.uDir.value.set(0, 1 / this._bh);
    r.setRenderTarget(this.brightRT);
    r.render(this.blurScene, this.postCamera);
    // 4. composição + paleta
    r.setRenderTarget(null);
    r.render(this.quantScene, this.postCamera);
  }
}
