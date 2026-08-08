// AIController.js - Autonomous Patrol & Wildlife Stealth AI
import * as THREE from 'three';

export class AIController {
  constructor(scene, environment, audioSystem) {
    this.scene = scene;
    this.env = environment;
    this.audio = audioSystem;

    this.aiPapiMesh = null;
    this.aiWildlifeSquad = [];

    // AI Papi State
    this.papiPosition = new THREE.Vector3(0, 0, 0);
    this.papiTargetIdx = 0;
    this.papiState = 'PATROL'; // 'PATROL' | 'CHASE' | 'SPRAY'
    this.papiSpeed = 4.5;
  }

  setAIPapiMesh(mesh) {
    this.aiPapiMesh = mesh;
    this.scene.add(this.aiPapiMesh);
    this.papiPosition.set(0, 0, 0);
    this.aiPapiMesh.position.copy(this.papiPosition);
  }

  spawnAIWildlife(type, startPos) {
    const mesh = this.env.createWildlifeMesh ? this.env.createWildlifeMesh(type) : null;
    if (!mesh) return;

    mesh.position.copy(startPos);
    this.scene.add(mesh);

    this.aiWildlifeSquad.push({
      type: type, // 'squirrel' | 'racoon'
      mesh: mesh,
      position: startPos.clone(),
      targetFeederIdx: Math.floor(Math.random() * this.env.feeders.length),
      state: 'APPROACH',
      speed: type === 'squirrel' ? 7.0 : 4.5,
      hasSeed: false
    });
  }

  update(delta, playerPos, activeCharType) {
    // 1. Update AI Papi (when player is Squirrel or Racoon)
    if (this.aiPapiMesh && (activeCharType === 'squirrel' || activeCharType === 'racoon')) {
      this.aiPapiMesh.visible = true;
      this.updateAIPapi(delta, playerPos);
    } else if (this.aiPapiMesh) {
      this.aiPapiMesh.visible = false;
    }

    // 2. Update AI Wildlife Squad (when player is Papi)
    if (activeCharType === 'papi') {
      this.updateAIWildlife(delta, playerPos);
    }
  }

  updateAIPapi(delta, playerPos) {
    const distToPlayer = this.papiPosition.distanceTo(playerPos);

    // If player is close and raiding, AI Papi enters CHASE state
    if (distToPlayer < 12.0) {
      this.papiState = 'CHASE';
    } else {
      this.papiState = 'PATROL';
    }

    let targetPos = new THREE.Vector3();

    if (this.papiState === 'CHASE') {
      targetPos.copy(playerPos);
      if (distToPlayer < 4.0) {
        // Spray hose sound & warning!
        this.audio.playSquirrelChitter();
      }
    } else {
      // Patrol between 3 birdfeeders
      const targetFeeder = this.env.feeders[this.papiTargetIdx];
      if (targetFeeder) {
        targetPos.set(targetFeeder.position.x, 0, targetFeeder.position.z);
        if (this.papiPosition.distanceTo(targetPos) < 2.0) {
          this.papiTargetIdx = (this.papiTargetIdx + 1) % this.env.feeders.length;
        }
      }
    }

    // Move AI Papi towards target
    const dir = targetPos.clone().sub(this.papiPosition);
    dir.y = 0;
    if (dir.lengthSq() > 0.1) {
      dir.normalize();
      this.papiPosition.addScaledVector(dir, this.papiSpeed * delta);
      this.aiPapiMesh.position.copy(this.papiPosition);
      this.aiPapiMesh.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  updateAIWildlife(delta, playerPos) {
    this.aiWildlifeSquad.forEach((w) => {
      if (w.state === 'APPROACH') {
        const feeder = this.env.feeders[w.targetFeederIdx];
        if (feeder) {
          const target = new THREE.Vector3(feeder.position.x, 0, feeder.position.z);
          const dir = target.clone().sub(w.position);
          dir.y = 0;

          if (dir.lengthSq() > 0.5) {
            dir.normalize();
            w.position.addScaledVector(dir, w.speed * delta);
            w.mesh.position.copy(w.position);
            w.mesh.rotation.y = Math.atan2(dir.x, dir.z);
          } else {
            // Raiding feeder!
            w.state = 'RETREAT';
            w.hasSeed = true;
            if (feeder.seedsRemaining > 0) {
              feeder.seedsRemaining = Math.max(0, feeder.seedsRemaining - 5);
            }
          }
        }
      } else if (w.state === 'RETREAT') {
        // Run back to nearest fence corner
        const escapeTarget = new THREE.Vector3(0, 0, -24);
        const dir = escapeTarget.clone().sub(w.position);
        dir.y = 0;
        dir.normalize();
        w.position.addScaledVector(dir, w.speed * delta);
        w.mesh.position.copy(w.position);

        if (w.position.distanceTo(escapeTarget) < 2.0) {
          // Escaped with seed!
          w.mesh.visible = false;
        }
      }
    });
  }
}
