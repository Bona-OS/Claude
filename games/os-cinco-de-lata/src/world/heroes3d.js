// Upgrade progressivo: troca o herói procedural pela malha 3D gerada no
// Higgsfield (GLB rigado + animado). Se o GLB não carregar, o boneco
// procedural permanece — zero regressão. O motor já pixeliza tudo em
// 480×270, então a malha entra no mesmo visual retrô automaticamente.
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/three/addons/loaders/GLTFLoader.js';
import { HERO_GLB } from './art.js';

const HERO_TARGET_HEIGHT = 1.95; // mesma altura visual do herói procedural
const HERO_FACING = 0;           // offset de rotação da malha (flip p/ Math.PI se virarem de costas)
const loader = new GLTFLoader();

export function upgradeHeroToGLB(group, member) {
  const url = HERO_GLB[member.id];
  if (!url) return;
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      // normaliza a altura e assenta a base no chão (y=0)
      let box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (size.y > 1e-3) model.scale.setScalar(HERO_TARGET_HEIGHT / size.y);
      box = new THREE.Box3().setFromObject(model);
      model.position.y -= box.min.y;
      model.rotation.y = HERO_FACING;
      model.traverse((o) => {
        if (o.isMesh || o.isSkinnedMesh) {
          o.castShadow = true;
          o.frustumCulled = false; // bbox de skinned mesh fura o culling ao animar
          if (o.material) o.material.side = THREE.DoubleSide;
        }
      });
      // substitui o visual procedural pela malha, preservando o grupo
      // (posição/rotação/escala/visibilidade continuam controlados pelas fases)
      for (const child of [...group.children]) group.remove(child);
      group.add(model);
      group.userData.limbs = null; // desliga a animação procedural de membros
      if (gltf.animations && gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        group.userData.mixer = mixer;
      }
    },
    undefined,
    () => { /* falhou o download/parse: mantém o herói procedural */ }
  );
}
