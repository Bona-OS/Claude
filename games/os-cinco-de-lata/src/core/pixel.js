// Pipeline de pixelização estilo Final Fantasy V "HD-2D":
// cena → RT 480×270 → bright-pass (240×135) → blur gaussiano H+V →
// composição com bloom → quantização para paleta de 32 cores + dithering
// Bayer 4×4. O canvas fica em 480×270 e o CSS estica pixelated.

import * as THREE from 'three';

export const PIXEL_W = 640;
export const PIXEL_H = 360;

// paleta natural e harmônica (rumo "Terra-média"): verdes ricos de mata,
// pedra/terra quentes, ouro de luz, azuis de céu e de distância atmosférica,
// prata da armadura, acentos. Menos ferrugem chapada, mais cor de mundo vivo.
const PALETTE = [
  // sombras profundas (frias, não pretas)
  '#0d1410', '#141d18', '#20281f', '#2b3428',
  // verdes de mata (base do mundo)
  '#1b3a17', '#295022', '#3a6b2b', '#4f8a35', '#6aa844', '#8fc65e', '#b9e08a',
  // terra / pedra quente
  '#3a2c1a', '#5a4530', '#7a6142', '#a08258', '#c4a878', '#e2cfa2',
  // ouro / luz do sol
  '#b8862f', '#e0a94a', '#f2c96a', '#f8e6a8', '#fbf4d8',
  // rocha fria / montanha na distância
  '#4a5560', '#6b7784', '#94a1ae', '#c2ccd6',
  // azuis de céu e névoa atmosférica (dá profundidade épica)
  '#1c2f4a', '#2f5480', '#4d7db0', '#7ba6d8', '#aecdef', '#8296a8',
  // prata da armadura
  '#565962', '#84888f', '#b0b4bb', '#dee2ea',
  // acentos vivos (pétala, perigo, água)
  '#b8402c', '#e07a5a', '#2f8f6f', '#e07a9a',
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
  uniform float uPaletteMix; // 1 = paleta pura (crunch), <1 = suaviza (bleed do original)
  uniform vec3 uPalette[${PALETTE.length}];
  varying vec2 vUv;

  // Bayer 4x4 compacto (0..1)
  float Bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }

  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    c += texture2D(tBloom, vUv).rgb * uBloom; // a luz floresce ANTES da paleta

    // grade cinematográfico: sombra fria, luz quente, +contraste, +saturação
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(lum), c, 1.14);          // satura
    c = (c - 0.5) * 1.07 + 0.5;           // contraste
    c += vec3(-0.02, 0.0, 0.04) * (1.0 - lum); // sombras puxam pro frio
    c += vec3(0.05, 0.025, 0.0) * lum;    // luzes puxam pro quente/dourado
    vec3 graded = clamp(c, 0.0, 1.0);

    vec2 px = gl_FragCoord.xy;
    float dither = Bayer2(0.5 * px) * 0.25 + Bayer2(px);
    vec3 cd = graded + (dither - 0.5) * 0.05; // dither mais suave

    float best = 1e9;
    vec3 bestC = uPalette[0];
    for (int i = 0; i < ${PALETTE.length}; i++) {
      vec3 d = cd - uPalette[i];
      float dist = dot(d * vec3(0.7, 1.0, 0.6), d);
      if (dist < best) { best = dist; bestC = uPalette[i]; }
    }
    // suaviza o "snap" da paleta com um sangramento do original graduado
    gl_FragColor = vec4(mix(graded, bestC, uPaletteMix), 1.0);
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
        uPaletteMix: { value: 0.72 }, // 72% paleta, 28% original = pixel rico, menos chapado
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
