// CharacterFactory.js - Procedural 3D Model Generator for Squirrel, Papi & Racoon
import * as THREE from 'three';

export class CharacterFactory {
  // 1. Create Squirrel Model ("Nutty")
  static createSquirrel() {
    const group = new THREE.Group();
    group.name = 'squirrel';

    const furMaterial = new THREE.MeshStandardMaterial({
      color: 0xc86414,
      roughness: 0.7,
      metalness: 0.1
    });
    const bellyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeedd,
      roughness: 0.8
    });
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2
    });
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0x331100,
      roughness: 0.5
    });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.35, 12, 12);
    bodyGeo.scale(1, 1.3, 1.1);
    const body = new THREE.Mesh(bodyGeo, furMaterial);
    body.position.y = 0.45;
    body.castShadow = true;
    group.add(body);

    // Belly patch
    const bellyGeo = new THREE.SphereGeometry(0.25, 10, 10);
    bellyGeo.scale(0.8, 1.1, 0.4);
    const belly = new THREE.Mesh(bellyGeo, bellyMaterial);
    belly.position.set(0, 0.42, 0.22);
    group.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, furMaterial);
    head.position.set(0, 0.82, 0.15);
    head.castShadow = true;
    group.add(head);

    // Snout
    const snoutGeo = new THREE.ConeGeometry(0.1, 0.16, 8);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, furMaterial);
    snout.position.set(0, 0.8, 0.34);
    group.add(snout);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nose = new THREE.Mesh(noseGeo, noseMaterial);
    nose.position.set(0, 0.82, 0.42);
    group.add(nose);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(0.14, 0.87, 0.28);
    const rightEye = leftEye.clone();
    rightEye.position.x = -0.14;
    group.add(leftEye);
    group.add(rightEye);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.06, 0.14, 6);
    const leftEar = new THREE.Mesh(earGeo, furMaterial);
    leftEar.position.set(0.12, 1.05, 0.12);
    leftEar.rotation.z = -0.2;
    const rightEar = leftEar.clone();
    rightEar.position.x = -0.12;
    rightEar.rotation.z = 0.2;
    group.add(leftEar);
    group.add(rightEar);

    // Fluffy Tail (Jointed Group for Wiggle)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.35, -0.25);

    const tailPart1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), furMaterial);
    tailPart1.scale.set(1, 1.6, 1.2);
    tailPart1.rotation.x = -0.6;
    tailGroup.add(tailPart1);

    const tailPart2 = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), furMaterial);
    tailPart2.scale.set(1.1, 1.8, 1.3);
    tailPart2.position.set(0, 0.3, -0.15);
    tailPart2.rotation.x = -1.1;
    tailGroup.add(tailPart2);

    tailGroup.castShadow = true;
    group.add(tailGroup);
    group.userData.tail = tailGroup;

    // Legs / Feet
    const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.25, 8);
    const leftLeg = new THREE.Mesh(legGeo, furMaterial);
    leftLeg.position.set(0.18, 0.12, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = -0.18;
    group.add(leftLeg);
    group.add(rightLeg);

    group.userData.height = 1.0;
    return group;
  }

  // 2. Create Papi Model ("The Feeder Guardian")
  static createPapi() {
    const group = new THREE.Group();
    group.name = 'papi';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcbb3, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // Legs / Pants
    const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.9, 10);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(0.28, 0.45, 0);
    leftLeg.castShadow = true;

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = -0.28;
    group.add(leftLeg);
    group.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.24, 0.15, 0.45);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0.28, 0.075, 0.08);
    const rightShoe = leftShoe.clone();
    rightShoe.position.x = -0.28;
    group.add(leftShoe);
    group.add(rightShoe);

    // Torso / Shirt
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.42, 1.1, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    group.add(torso);

    // Apron
    const apronGeo = new THREE.BoxGeometry(0.7, 0.9, 0.06);
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 1.4, 0.25);
    group.add(apron);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 2.22, 0);
    head.castShadow = true;
    group.add(head);

    // White Hair / Sideburns
    const hairGeo = new THREE.SphereGeometry(0.33, 10, 10);
    hairGeo.scale(1.02, 0.6, 1.02);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.32, -0.05);
    group.add(hair);

    // White Mustache
    const mustacheGeo = new THREE.BoxGeometry(0.32, 0.08, 0.12);
    const mustache = new THREE.Mesh(mustacheGeo, hairMat);
    mustache.position.set(0, 2.12, 0.28);
    group.add(mustache);

    // Visor Hat
    const hatDome = new THREE.CylinderGeometry(0.33, 0.35, 0.15, 12);
    const hat = new THREE.Mesh(hatDome, hatMat);
    hat.position.set(0, 2.45, 0);

    const visorBrim = new THREE.CylinderGeometry(0.46, 0.46, 0.03, 12);
    visorBrim.scale(1, 1, 0.6);
    const brim = new THREE.Mesh(visorBrim, hatMat);
    brim.position.set(0, 2.4, 0.18);
    group.add(hat);
    group.add(brim);

    // Arms & Water Hose Nozzle
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 8);

    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(0.55, 1.5, 0);
    leftArm.rotation.z = -0.3;
    group.add(leftArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.55, 1.5, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.rotation.x = Math.PI / 3;
    rightArmGroup.add(rightArm);

    // Hose Nozzle in Hand
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3 });
    const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0, -0.3, 0.3);
    rightArmGroup.add(nozzle);
    group.add(rightArmGroup);
    group.userData.hoseArm = rightArmGroup;

    group.userData.height = 2.5;
    return group;
  }

  // 3. Create Racoon Model ("Bandit")
  static createRacoon() {
    const group = new THREE.Group();
    group.name = 'racoon';

    const furMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.42, 12, 12);
    bodyGeo.scale(1.1, 1.1, 1.4);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.y = 0.48;
    body.castShadow = true;
    group.add(body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.3, 10, 10);
    bellyGeo.scale(0.9, 0.8, 1.1);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 0.42, 0.2);
    group.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0, 0.75, 0.35);
    head.castShadow = true;
    group.add(head);

    // Bandit Mask
    const maskGeo = new THREE.BoxGeometry(0.45, 0.14, 0.2);
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.position.set(0, 0.76, 0.45);
    group.add(mask);

    // Striped Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.45, -0.6);

    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.CylinderGeometry(0.16 - i * 0.02, 0.16 - i * 0.02, 0.15, 8);
      ringGeo.rotateX(Math.PI / 4);
      const ring = new THREE.Mesh(ringGeo, i % 2 === 0 ? furMat : stripeMat);
      ring.position.set(0, -i * 0.1, -i * 0.12);
      tailGroup.add(ring);
    }
    group.add(tailGroup);

    group.userData.height = 1.1;
    return group;
  }
}
