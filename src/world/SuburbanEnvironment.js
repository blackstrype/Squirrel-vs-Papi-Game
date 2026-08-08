// SuburbanEnvironment.js - Procedural 3D World Generation for Backyard & Neighborhood
import * as THREE from 'three';

export class SuburbanEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.feeders = [];
    this.goldenAcorns = [];
    this.nestPosition = new THREE.Vector3(0, 8.5, -4); // Squirrel Tree Nest
    this.powerLines = [];

    this.buildWorld();
  }

  buildWorld() {
    this.buildGroundAndNeighborhood();
    this.buildPapisHouse();
    this.buildFences();
    this.buildOakTreeAndNest();
    this.buildGardenShed();
    this.buildPatio();
    this.buildBirdFeeders();
    this.buildTelephonePolesAndWires();
    this.buildGoldenAcorns();
  }

  // 1. Ground Terrain & Neighborhood Sidewalks
  buildGroundAndNeighborhood() {
    // Papi's Lawn Grass
    const lawnGeo = new THREE.PlaneGeometry(50, 40);
    lawnGeo.rotateX(-Math.PI / 2);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x48bb78,
      roughness: 0.8,
      metalness: 0.1
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.set(0, 0, -5);
    lawn.receiveShadow = true;
    this.scene.add(lawn);
    this.colliders.push({ type: 'ground', mesh: lawn, height: 0 });

    // Surrounding Asphalt Street
    const streetGeo = new THREE.PlaneGeometry(120, 16);
    streetGeo.rotateX(-Math.PI / 2);
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.position.set(0, -0.02, 18);
    street.receiveShadow = true;
    this.scene.add(street);

    // Sidewalks
    const sidewalkGeo = new THREE.PlaneGeometry(120, 4);
    sidewalkGeo.rotateX(-Math.PI / 2);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xcbcfd6, roughness: 0.7 });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(0, 0.01, 9);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);
  }

  // 2. Papi's 2-Story House
  buildPapisHouse() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(0, 0, 0);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 }); // Yellow siding
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }); // Red roof
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });

    // Main House Block
    const houseGeo = new THREE.BoxGeometry(16, 8, 12);
    const houseMesh = new THREE.Mesh(houseGeo, wallMat);
    houseMesh.position.set(0, 4, 2);
    houseMesh.castShadow = true;
    houseMesh.receiveShadow = true;
    houseGroup.add(houseMesh);
    this.colliders.push({ type: 'box', mesh: houseMesh, box: new THREE.Box3().setFromObject(houseMesh) });

    // Roof Apex
    const roofGeo = new THREE.ConeGeometry(12, 4.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 10.25, 2);
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    // Porch Deck & Steps
    const deckGeo = new THREE.BoxGeometry(18, 0.4, 4);
    const deck = new THREE.Mesh(deckGeo, woodMat);
    deck.position.set(0, 0.2, -5.8);
    deck.castShadow = true;
    deck.receiveShadow = true;
    houseGroup.add(deck);
    this.colliders.push({ type: 'box', mesh: deck, box: new THREE.Box3().setFromObject(deck) });

    this.scene.add(houseGroup);
  }

  // 3. Perimeter Fences with Climbable Posts
  buildFences() {
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });

    // Back & Side Fence walls
    const fenceSpecs = [
      { x: 0, z: -24, w: 50, h: 3, rot: 0 }, // Back Fence
      { x: -24, z: -5, w: 40, h: 3, rot: Math.PI / 2 }, // Left Fence
      { x: 24, z: -5, w: 40, h: 3, rot: Math.PI / 2 }  // Right Fence
    ];

    fenceSpecs.forEach((spec) => {
      const fenceGeo = new THREE.BoxGeometry(spec.w, spec.h, 0.3);
      const fence = new THREE.Mesh(fenceGeo, fenceMat);
      fence.position.set(spec.x, spec.h / 2, spec.z);
      fence.rotation.y = spec.rot;
      fence.castShadow = true;
      fence.receiveShadow = true;
      this.scene.add(fence);

      this.colliders.push({
        type: 'climbable',
        mesh: fence,
        box: new THREE.Box3().setFromObject(fence),
        topHeight: spec.h
      });
    });
  }

  // 4. Giant Oak Tree & Squirrel Drey Nest
  buildOakTreeAndNest() {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, 0, -14);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543618, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    // Climbable Main Trunk
    const trunkGeo = new THREE.CylinderGeometry(1.2, 1.6, 12, 12);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 6;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    this.colliders.push({
      type: 'climbable_tree',
      mesh: trunk,
      center: new THREE.Vector2(0, -14),
      radius: 1.6,
      maxHeight: 12
    });

    // Thick Horizontal Branches
    const branchGeo = new THREE.CylinderGeometry(0.4, 0.6, 8, 8);
    branchGeo.rotateZ(Math.PI / 3);

    const branch1 = new THREE.Mesh(branchGeo, trunkMat);
    branch1.position.set(3, 8.5, 0);
    branch1.castShadow = true;
    treeGroup.add(branch1);

    const branch2 = branch1.clone();
    branch2.rotation.z = -Math.PI / 3;
    branch2.position.set(-3, 9, 1);
    treeGroup.add(branch2);

    // Leaves Canopy Spheres
    const foliageCluster = [
      { x: 0, y: 13, z: 0, r: 4.5 },
      { x: 3.5, y: 11, z: 1.5, r: 3.5 },
      { x: -3.5, y: 11.5, z: -1.5, r: 3.8 }
    ];

    foliageCluster.forEach((f) => {
      const leafGeo = new THREE.SphereGeometry(f.r, 10, 10);
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(f.x, f.y, f.z);
      leafMesh.castShadow = true;
      treeGroup.add(leafMesh);
    });

    // Squirrel Nest (Drey) on main branch
    const nestGeo = new THREE.SphereGeometry(0.9, 10, 10);
    nestGeo.scale(1.2, 0.8, 1.2);
    const nestMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    const nest = new THREE.Mesh(nestGeo, nestMat);
    nest.position.set(0, 8.5, 1);
    nest.castShadow = true;
    treeGroup.add(nest);

    // Glowing Nest Indicator Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.5, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 8.52, 1);
    treeGroup.add(ring);

    this.scene.add(treeGroup);
  }

  // 5. Garden Shed
  buildGardenShed() {
    const shedGroup = new THREE.Group();
    shedGroup.position.set(-16, 0, -16);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    const shedGeo = new THREE.BoxGeometry(6, 4.5, 6);
    const shed = new THREE.Mesh(shedGeo, wallMat);
    shed.position.y = 2.25;
    shed.castShadow = true;
    shed.receiveShadow = true;
    shedGroup.add(shed);

    const roofGeo = new THREE.ConeGeometry(5, 2.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.75;
    roof.castShadow = true;
    shedGroup.add(roof);

    this.scene.add(shedGroup);
    this.colliders.push({ type: 'box', mesh: shed, box: new THREE.Box3().setFromObject(shed) });
  }

  // 6. Patio Furniture & Garden Hose Reel
  buildPatio() {
    const patioGroup = new THREE.Group();
    patioGroup.position.set(12, 0, -10);

    const patioGeo = new THREE.PlaneGeometry(10, 8);
    patioGeo.rotateX(-Math.PI / 2);
    const patioMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const patioFloor = new THREE.Mesh(patioGeo, patioMat);
    patioFloor.position.y = 0.02;
    patioFloor.receiveShadow = true;
    patioGroup.add(patioFloor);

    // Hose Reel Box
    const reelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const reelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 12);
    const reel = new THREE.Mesh(reelGeo, reelMat);
    reel.position.set(-4, 0.4, -2);
    reel.castShadow = true;
    patioGroup.add(reel);

    this.scene.add(patioGroup);
  }

  // 7. 3 Interactive Birdfeeders
  buildBirdFeeders() {
    const feederMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

    const feederLocations = [
      { id: 1, name: 'Tree Hanging Feeder', x: 2.2, y: 7.2, z: -13, type: 'hanging' },
      { id: 2, name: 'Baffle Pole Feeder', x: -12, y: 3.5, z: -10, type: 'pole' },
      { id: 3, name: 'Patio Tray Feeder', x: 14, y: 2.0, z: -8, type: 'tray' }
    ];

    feederLocations.forEach((loc) => {
      const fGroup = new THREE.Group();
      fGroup.position.set(loc.x, 0, loc.z);

      if (loc.type === 'pole' || loc.type === 'tray') {
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, loc.y, 8);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = loc.y / 2;
        pole.castShadow = true;
        fGroup.add(pole);

        if (loc.type === 'pole') {
          // Metal Baffle Guard cone
          const baffleGeo = new THREE.ConeGeometry(0.7, 0.8, 12);
          const baffle = new THREE.Mesh(baffleGeo, poleMat);
          baffle.position.y = loc.y - 1.0;
          baffle.castShadow = true;
          fGroup.add(baffle);
        }
      }

      // Feeder House Body
      const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
      const body = new THREE.Mesh(bodyGeo, feederMat);
      body.position.y = loc.y;
      body.castShadow = true;
      fGroup.add(body);

      // Seed Content Mesh inside feeder
      const seedGeo = new THREE.BoxGeometry(0.65, 0.9, 0.65);
      const seedMesh = new THREE.Mesh(seedGeo, seedMat);
      seedMesh.position.y = loc.y;
      fGroup.add(seedMesh);

      // Roof Lid
      const lidGeo = new THREE.ConeGeometry(0.8, 0.5, 4);
      lidGeo.rotateY(Math.PI / 4);
      const lid = new THREE.Mesh(lidGeo, feederMat);
      lid.position.y = loc.y + 0.85;
      lid.castShadow = true;
      fGroup.add(lid);

      this.scene.add(fGroup);

      this.feeders.push({
        id: loc.id,
        name: loc.name,
        position: new THREE.Vector3(loc.x, loc.y, loc.z),
        seedsRemaining: 25,
        maxSeeds: 25,
        group: fGroup,
        seedMesh: seedMesh
      });
    });
  }

  // 8. Telephone Poles & Overhead Power Wires for Parkour Wire Walking
  buildTelephonePolesAndWires() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 3 });

    const pole1Pos = new THREE.Vector3(-22, 6, 8);
    const pole2Pos = new THREE.Vector3(22, 6, 8);

    [pole1Pos, pole2Pos].forEach((pos) => {
      const pGeo = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
      const pole = new THREE.Mesh(pGeo, poleMat);
      pole.position.copy(pos);
      pole.castShadow = true;
      this.scene.add(pole);

      // Crossbar
      const barGeo = new THREE.BoxGeometry(2.5, 0.2, 0.2);
      const bar = new THREE.Mesh(barGeo, poleMat);
      bar.position.set(pos.x, pos.y + 5.5, pos.z);
      this.scene.add(bar);
    });

    // Wire Line connects pole 1 to pole 2 high overhead
    const wirePoints = [
      new THREE.Vector3(-22, 11.5, 8),
      new THREE.Vector3(0, 10.2, 8), // Catenary curve dip
      new THREE.Vector3(22, 11.5, 8)
    ];

    const curve = new THREE.QuadraticBezierCurve3(wirePoints[0], wirePoints[1], wirePoints[2]);
    const points = curve.getPoints(30);
    const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
    const wireLine = new THREE.Line(wireGeo, wireMat);
    this.scene.add(wireLine);

    this.powerLines.push(curve);
  }

  // 9. 10 Collectible Golden Acorns in Tricky Parkour Locations
  buildGoldenAcorns() {
    const acornMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });

    const acornSpots = [
      new THREE.Vector3(0, 12.8, 2),    // Peak of House Roof
      new THREE.Vector3(0, 10.4, 8),    // Center of Overhead Power Wire
      new THREE.Vector3(-16, 6.2, -16), // Shed Roof Peak
      new THREE.Vector3(0, 9.6, -14),   // High Oak Branch
      new THREE.Vector3(-24, 3.2, -5),  // Left Fence Corner Post
      new THREE.Vector3(24, 3.2, -5),   // Right Fence Corner Post
      new THREE.Vector3(-12, 4.2, -10), // On top of Feeder #2 Baffle
      new THREE.Vector3(12, 0.8, -10),  // On Patio Table
      new THREE.Vector3(-22, 12.0, 8),  // Top of Left Telephone Pole
      new THREE.Vector3(0, 9.2, -13)    // Directly inside Drey Nest
    ];

    acornSpots.forEach((pos, idx) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      // Acorn Nut
      const nutGeo = new THREE.SphereGeometry(0.22, 10, 10);
      nutGeo.scale(1, 1.3, 1);
      const nut = new THREE.Mesh(nutGeo, acornMat);
      nut.castShadow = true;
      group.add(nut);

      // Acorn Cap
      const capGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.12, 10);
      const cap = new THREE.Mesh(capGeo, acornMat);
      cap.position.y = 0.2;
      group.add(cap);

      this.scene.add(group);
      this.goldenAcorns.push({
        id: idx,
        position: pos,
        mesh: group,
        collected: false
      });
    });
  }
}
