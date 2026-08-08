// PlayerController.js - FPS Camera, Mouse Look & Subway Surfers Branch Parkour
import * as THREE from 'three';

export class PlayerController {
  constructor(sceneManager, physics, audioSystem) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    this.physics = physics;
    this.audio = audioSystem;

    this.activeCharacterType = 'squirrel'; // 'squirrel' | 'papi' | 'racoon'
    this.characterMeshes = {};
    this.activeMesh = null;

    // Movement state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isGrounded = true;
    this.isClimbing = false;
    this.isSprayingHose = false;

    // Camera FPS Mouse Look
    this.isFirstPerson = true; // First person default
    this.yaw = 0; // Left/Right camera rotation
    this.pitch = 0; // Up/Down camera pitch
    this.isPointerLocked = false;

    // Subway Surfers Branch Parkour State
    this.onBranchMode = false;
    this.currentBranchData = null;
    this.branchU = 0; // Distance along branch
    this.branchYawAngle = 0; // Yaw angle around branch cylinder (rad)
    this.branchCooldown = 0; // Cooldown timer after jumping off branch

    // Stats & Inventory
    this.seedInventory = 0;
    this.maxSeedCapacity = 15;
    this.totalSeedsStolen = 0;
    this.goldenAcornsCollected = 0;

    // Water Hose Particles Mesh Group
    this.hoseParticles = [];
    this.setupHoseParticles();

    // Input listeners
    this.keys = {};
    this.setupInputs();

    // Camera target
    this.cameraTarget = new THREE.Vector3();
  }

  // Key Check Helpers for ASDW / WASD & Arrows
  isW() {
    return !!(this.keys['KeyW'] || this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']);
  }
  isS() {
    return !!(this.keys['KeyS'] || this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']);
  }
  isA() {
    return !!(this.keys['KeyA'] || this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']);
  }
  isD() {
    return !!(this.keys['KeyD'] || this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']);
  }
  isE() {
    return !!(this.keys['KeyE'] || this.keys['e'] || this.keys['E']);
  }
  isSprint() {
    return !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['Shift'] || this.keys['shift']);
  }

  setCharacterMeshes(meshes) {
    this.characterMeshes = meshes;
    this.switchCharacter(this.activeCharacterType);
  }

  setupHoseParticles() {
    this.hoseParticleGroup = new THREE.Group();
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const pGeo = new THREE.SphereGeometry(0.12, 6, 6);

    for (let i = 0; i < 25; i++) {
      const p = new THREE.Mesh(pGeo, waterMat);
      p.visible = false;
      this.hoseParticleGroup.add(p);
      this.hoseParticles.push({
        mesh: p,
        velocity: new THREE.Vector3(),
        life: 0
      });
    }
    this.scene.add(this.hoseParticleGroup);
  }

  switchCharacter(type) {
    if (!this.characterMeshes[type]) return;

    if (this.activeMesh) {
      this.activeMesh.visible = false;
    }

    this.activeCharacterType = type;
    this.activeMesh = this.characterMeshes[type];
    this.activeMesh.visible = true;

    // Reset position above ground
    if (type === 'squirrel') {
      this.position.set(0, 1.0, 5);
    } else if (type === 'papi') {
      this.position.set(0, 0.1, 0);
    } else if (type === 'racoon') {
      this.position.set(-5, 0.5, 5);
    }
    this.activeMesh.position.copy(this.position);
    this.onBranchMode = false;
    this.branchCooldown = 0;
  }

  setupInputs() {
    // Pointer lock for FPS Mouse Look
    const canvas = this.sceneManager.canvas;
    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === canvas);
    });

    // Mouse movement listener for FPS pitch and yaw
    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        const sensitivity = 0.0022;
        this.yaw += e.movementX * sensitivity;
        this.pitch -= e.movementY * sensitivity;

        // Clamp vertical pitch (-85 deg to +85 deg)
        const maxPitch = Math.PI / 2.1;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
      }
    });

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.key.toUpperCase()] = true;
      }

      // Quick Character Switch Hotkeys
      if (e.code === 'Digit1' || e.key === '1') this.switchCharacter('squirrel');
      if (e.code === 'Digit2' || e.key === '2') this.switchCharacter('papi');
      if (e.code === 'Digit3' || e.key === '3') this.switchCharacter('racoon');

      // Toggle First / Third Person Camera
      if (e.code === 'KeyV' || e.key.toLowerCase() === 'v') {
        this.isFirstPerson = !this.isFirstPerson;
      }

      // Jump / Leave Branch Mode
      if (e.code === 'Space' || e.key === ' ') {
        this.performJump();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.key.toUpperCase()] = false;
      }
    });

    // Mouse click for action / hose spray
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.activeCharacterType === 'papi') {
        this.isSprayingHose = true;
        this.audio.startHoseSpray();
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 && this.activeCharacterType === 'papi') {
        this.isSprayingHose = false;
        this.audio.stopHoseSpray();
      }
    });
  }

  performJump() {
    if (this.onBranchMode) {
      // Jump off branch back to free movement
      this.onBranchMode = false;
      this.branchCooldown = 1.2; // 1.2 second cooldown before re-attaching
      this.velocity.y = 11.0;
      this.position.y += 1.2; // Pop clear of branch radius
      this.isGrounded = false;
      this.audio.playJump();
      return;
    }

    if (this.isGrounded || this.isClimbing) {
      this.velocity.y = this.activeCharacterType === 'squirrel' ? 9.5 : 7.0;
      this.isGrounded = false;
      this.isClimbing = false;
      this.audio.playJump();
    }
  }

  update(delta) {
    if (!this.activeMesh) return;

    // Decrement branch cooldown timer
    if (this.branchCooldown > 0) {
      this.branchCooldown -= delta;
    }

    // 1. Check if Squirrel enters Subway Surfers Branch Mode
    if (this.activeCharacterType === 'squirrel' && !this.onBranchMode && this.branchCooldown <= 0) {
      const branchCheck = this.physics.checkBranchRail(this.position);
      if (branchCheck.onBranch) {
        this.onBranchMode = true;
        this.currentBranchData = branchCheck;
        this.branchU = branchCheck.currentU;
        this.branchYawAngle = 0;
      }
    }

    // 2. Execute Movement Modes
    if (this.onBranchMode && this.currentBranchData) {
      this.updateSubwaySurfersBranchMode(delta);
    } else {
      this.updateFPSFreeMovement(delta);
    }

    // 3. Sync character mesh position & rotation
    this.activeMesh.position.copy(this.position);
    this.activeMesh.rotation.y = -this.yaw;

    // In First Person View, hide local character head/body mesh so it doesn't block camera
    if (this.isFirstPerson) {
      this.activeMesh.visible = false;
    } else {
      this.activeMesh.visible = true;
    }

    // Handle Papi Water Hose Spray
    if (this.isE() && this.activeCharacterType === 'papi') {
      this.isSprayingHose = true;
    }
    this.updateHoseParticles(delta);

    // 4. Update Camera View (First Person FPS or 3rd Person)
    this.updateFPSCamera();
  }

  // SUBWAY SURFERS BRANCH / RAIL PARKOUR MODE
  updateSubwaySurfersBranchMode(delta) {
    const b = this.currentBranchData;
    const speed = 10.0;
    const yawSpeed = 4.0;

    // [W] Forward along branch
    if (this.isW()) {
      this.branchU += speed * delta;
    }

    // [S] Backward along branch
    if (this.isS()) {
      this.branchU -= speed * delta;
    }

    // [A] Yaw left around branch cylinder
    if (this.isA()) {
      this.branchYawAngle -= yawSpeed * delta;
    }

    // [D] Yaw right around branch cylinder
    if (this.isD()) {
      this.branchYawAngle += yawSpeed * delta;
    }

    // Clamp distance along branch
    if (this.branchU <= 0 || this.branchU >= b.length) {
      this.onBranchMode = false;
      this.branchCooldown = 0.8;
      return;
    }

    // Compute center point along branch vector
    const centerPt = b.origin.clone().addScaledVector(b.direction, this.branchU);

    // Compute perp vector for yaw rotation around cylinder
    let upVec = new THREE.Vector3(0, 1, 0);
    if (Math.abs(b.direction.y) > 0.9) upVec.set(1, 0, 0);
    const sideVec = new THREE.Vector3().crossVectors(b.direction, upVec).normalize();
    const normalVec = new THREE.Vector3().crossVectors(sideVec, b.direction).normalize();

    // Position on branch surface using yaw angle
    const offset = sideVec.clone().multiplyScalar(Math.cos(this.branchYawAngle) * b.radius)
      .add(normalVec.clone().multiplyScalar(Math.sin(this.branchYawAngle) * b.radius + b.radius));

    this.position.copy(centerPt).add(offset);
    this.velocity.set(0, 0, 0);

    // Tail wiggle animation
    if (this.activeMesh.userData.tail) {
      this.activeMesh.userData.tail.rotation.z = Math.sin(Date.now() * 0.02) * 0.5;
    }
  }

  // FPS FREE MOVEMENT
  updateFPSFreeMovement(delta) {
    let moveSpeed = 7.5;
    if (this.activeCharacterType === 'squirrel') moveSpeed = 10.0;
    if (this.activeCharacterType === 'racoon') moveSpeed = 7.0;
    if (this.isSprint()) moveSpeed *= 1.5;

    // Camera forward and right direction vectors
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));

    const moveVector = new THREE.Vector3();

    if (this.isW()) moveVector.add(forward);
    if (this.isS()) moveVector.sub(forward);
    if (this.isA()) moveVector.sub(right); // A = Move Left
    if (this.isD()) moveVector.add(right); // D = Move Right

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      this.position.x += moveVector.x * moveSpeed * delta;
      this.position.z += moveVector.z * moveSpeed * delta;
    }

    // Vertical tree/fence climbing for squirrel
    if (this.activeCharacterType === 'squirrel') {
      const treeCheck = this.physics.checkTreeClimbing(this.position);
      const fenceCheck = this.physics.checkFenceClimbing(this.position);

      if (treeCheck.canClimb && (this.isW() || this.keys['Space'])) {
        this.isClimbing = true;
        this.position.y += 6.5 * delta;
        this.velocity.y = 0;
      } else if (fenceCheck.canClimb && (this.isW() || this.keys['Space'])) {
        this.isClimbing = true;
        this.position.y += 5.5 * delta;
        this.velocity.y = 0;
      } else {
        this.isClimbing = false;
      }
    }

    // Gravity & Ground Physics
    if (!this.isClimbing) {
      this.velocity.y -= 22.0 * delta;
      this.position.y += this.velocity.y * delta;

      const groundY = this.physics.checkGroundCollision(this.position);
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // Clamp inside yard boundaries
    this.physics.clampBoundaries(this.position);

    // Resolve Solid Object Wall Collisions (House, Shed, Tree Trunk, Fences)
    const pRadius = this.activeCharacterType === 'squirrel' ? 0.4 : 0.6;
    this.physics.resolveSolidCollisions(this.position, pRadius, this.isClimbing, this.onBranchMode);
  }

  updateHoseParticles(delta) {
    if (this.isSprayingHose && this.activeCharacterType === 'papi') {
      const p = this.hoseParticles.find((item) => !item.mesh.visible);
      if (p) {
        const lookDir = new THREE.Vector3(
          Math.sin(this.yaw) * Math.cos(this.pitch),
          Math.sin(this.pitch),
          -Math.cos(this.yaw) * Math.cos(this.pitch)
        );

        p.mesh.position.copy(this.position).add(new THREE.Vector3(0, 1.8, 0)).add(lookDir.clone().multiplyScalar(0.6));
        p.velocity.copy(lookDir).multiplyScalar(22);
        p.life = 0.5;
        p.mesh.visible = true;
      }
    }

    this.hoseParticles.forEach((p) => {
      if (p.mesh.visible) {
        p.life -= delta;
        p.velocity.y -= 12 * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);

        if (p.life <= 0 || p.mesh.position.y <= 0) {
          p.mesh.visible = false;
        }
      }
    });
  }

  // FIRST PERSON FPS & THIRD PERSON CAMERA CALCULATIONS
  updateFPSCamera() {
    let eyeHeight = 0.85; // Squirrel
    if (this.activeCharacterType === 'papi') eyeHeight = 2.1;
    if (this.activeCharacterType === 'racoon') eyeHeight = 0.75;

    const eyePosition = this.position.clone().add(new THREE.Vector3(0, eyeHeight, 0));

    if (this.isFirstPerson) {
      // First Person Camera Position at Eye Level
      this.camera.position.copy(eyePosition);

      // Compute look direction target from yaw & pitch
      const lookTarget = new THREE.Vector3(
        eyePosition.x + Math.sin(this.yaw) * Math.cos(this.pitch),
        eyePosition.y + Math.sin(this.pitch),
        eyePosition.z - Math.cos(this.yaw) * Math.cos(this.pitch)
      );

      this.camera.lookAt(lookTarget);
    } else {
      // Third Person Follow Camera
      const dist = this.activeCharacterType === 'squirrel' ? 4.5 : 7.0;
      const camOffset = new THREE.Vector3(
        -Math.sin(this.yaw) * dist,
        2.5,
        Math.cos(this.yaw) * dist
      );

      this.camera.position.copy(this.position).add(camOffset);
      this.camera.lookAt(this.position.clone().add(new THREE.Vector3(0, eyeHeight, 0)));
    }
  }
}
