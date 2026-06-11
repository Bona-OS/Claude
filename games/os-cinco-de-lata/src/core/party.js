// Os Cinco de Lata — grupo jogável. Troca de líder com 1-5; os outros
// quatro seguem em fila pelo histórico de posições do líder.

import { makeHero } from '../world/builders.js';

export const PARTY_MEMBERS = [
  {
    id: 1, name: 'Tarso', color: '#dcdce6',
    speedMult: 1.0, jumpMult: 1.0, scale: 1.0,
    ability: 'Espadada (E): golpe à frente',
    look: { sword: true },
  },
  {
    id: 2, name: 'Brio', color: '#e9bc7e',
    speedMult: 1.25, jumpMult: 1.3, scale: 0.78,
    ability: 'O mais veloz; pulo mais alto',
    look: { cape: true },
  },
  {
    id: 3, name: 'Tino', color: '#9bc25e',
    speedMult: 1.0, jumpMult: 1.0, scale: 0.95,
    ability: 'Cuspe-Espinho (E): dispara um espinho',
    look: { crossbow: true },
  },
  {
    id: 4, name: 'Garra', color: '#83858f',
    speedMult: 0.8, jumpMult: 0.85, scale: 1.18,
    ability: 'Escudo (segure E): bloqueia tudo, parado',
    look: { shield: true, broad: true },
  },
  {
    id: 5, name: 'Ávio', color: '#c2602f',
    speedMult: 1.0, jumpMult: 1.0, scale: 1.0,
    ability: 'Vigia: avisos de perigo chegam antes',
    look: { hood: true },
  },
];

const FOLLOW_SPACING = 9; // amostras de histórico entre cada seguidor

export class PartyManager {
  constructor() {
    this.activeLeaderId = 1;
    this.positionHistory = [];
    this.meshes = new Map(); // id → THREE.Group
  }

  get leader() { return PARTY_MEMBERS[this.activeLeaderId - 1]; }
  member(id) { return PARTY_MEMBERS[id - 1]; }

  // cria os 5 modelos e adiciona à cena; o líder é controlado pela fase
  spawn(scene, position) {
    this.positionHistory = [];
    this.meshes.clear();
    for (const m of PARTY_MEMBERS) {
      const mesh = makeHero(m);
      mesh.position.copy(position);
      scene.add(mesh);
      this.meshes.set(m.id, mesh);
    }
    return this.leaderMesh;
  }

  get leaderMesh() { return this.meshes.get(this.activeLeaderId); }

  switchLeader(id) {
    if (id < 1 || id > 5 || id === this.activeLeaderId || !this.meshes.size) return null;
    const oldMesh = this.leaderMesh;
    const newMesh = this.meshes.get(id);
    // o novo líder assume a posição/rotação atual do antigo
    const pos = oldMesh.position.clone();
    const rot = oldMesh.rotation.y;
    oldMesh.position.copy(newMesh.position);
    newMesh.position.copy(pos);
    newMesh.rotation.y = rot;
    this.activeLeaderId = id;
    return this.member(id);
  }

  // chamar todo frame com a posição do líder
  updateFollowers(leaderPos, leaderRotY) {
    const last = this.positionHistory[this.positionHistory.length - 1];
    if (!last || last.distanceToSquared(leaderPos) > 0.05) {
      this.positionHistory.push(leaderPos.clone());
      if (this.positionHistory.length > FOLLOW_SPACING * 5 + 2) this.positionHistory.shift();
    }
    let slot = 1;
    for (const m of PARTY_MEMBERS) {
      if (m.id === this.activeLeaderId) continue;
      const mesh = this.meshes.get(m.id);
      if (!mesh) continue;
      const idx = this.positionHistory.length - 1 - slot * FOLLOW_SPACING;
      if (idx >= 0) {
        const target = this.positionHistory[idx];
        mesh.position.lerp(target, 0.18);
        const dir = target.clone().sub(mesh.position);
        if (dir.lengthSq() > 0.001) mesh.rotation.y = Math.atan2(dir.x, dir.z);
      } else {
        // sem histórico ainda: fica atrás do líder
        mesh.position.lerp(leaderPos.clone().add(
          { x: Math.sin(leaderRotY + Math.PI) * slot * 1.4, y: 0, z: Math.cos(leaderRotY + Math.PI) * slot * 1.4 }
        ), 0.1);
      }
      slot++;
    }
  }

  // só o líder visível (para fases montadas/menus)
  soloLeader(visible) {
    for (const m of PARTY_MEMBERS) {
      const mesh = this.meshes.get(m.id);
      if (mesh) mesh.visible = visible ? m.id === this.activeLeaderId : true;
    }
  }
}
