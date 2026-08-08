// PhysicsEngine.js - Collision, Raycasting & Subway Surfers Branch Parkour Physics
import * as THREE from 'three';

export class PhysicsEngine {
  constructor(environment) {
    this.env = environment;
    this.raycaster = new THREE.Raycaster();
  }

  // Check if player position intersects with ground or climbable surfaces
  checkGroundCollision(position, radius = 0.5) {
    let groundY = 0; // Lawn base height

    // Check Patio Deck height (0.4)
    if (position.x >= -9 && position.x <= 9 && position.z >= -7.8 && position.z <= -3.8) {
      groundY = 0.4;
    }

    // Check Shed Roof height (4.5)
    if (position.x >= -19 && position.x <= -13 && position.z >= -19 && position.z <= -13) {
      groundY = 4.5;
    }

    // Check House Roof peak (~8.0 to 10.0)
    if (position.x >= -8 && position.x <= 8 && position.z >= -4 && position.z <= 8) {
      groundY = 8.0;
    }

    return groundY;
  }

  // Check if position is near a climbable Tree Trunk
  checkTreeClimbing(position) {
    const treeCenter = new THREE.Vector2(0, -14);
    const pos2D = new THREE.Vector2(position.x, position.z);
    const dist = pos2D.distanceTo(treeCenter);

    if (dist < 2.2 && position.y >= 0.5 && position.y <= 12) {
      return { canClimb: true, targetX: 0, targetZ: -14 + 1.8 };
    }
    return { canClimb: false };
  }

  // Check if position is near a climbable Fence
  checkFenceClimbing(position) {
    // Back Fence (z = -24)
    if (Math.abs(position.z - (-24)) < 0.8 && position.x >= -24 && position.x <= 24) {
      return { canClimb: true, topY: 3.0 };
    }
    // Left Fence (x = -24)
    if (Math.abs(position.x - (-24)) < 0.8 && position.z >= -24 && position.z <= 15) {
      return { canClimb: true, topY: 3.0 };
    }
    // Right Fence (x = 24)
    if (Math.abs(position.x - 24) < 0.8 && position.z >= -24 && position.z <= 15) {
      return { canClimb: true, topY: 3.0 };
    }

    return { canClimb: false };
  }

  // Detect Subway Surfers style Branch / Rail surfaces (Tree branches, power wires, fence rails)
  checkBranchRail(position) {
    const branches = [
      // 1. Oak Tree Right Branch
      {
        type: 'Oak Branch Right',
        start: new THREE.Vector3(0, 8.5, -14),
        end: new THREE.Vector3(6.5, 9.5, -14),
        radius: 0.55
      },
      // 2. Oak Tree Left Branch
      {
        type: 'Oak Branch Left',
        start: new THREE.Vector3(0, 9.0, -13),
        end: new THREE.Vector3(-6.5, 10.0, -13),
        radius: 0.55
      },
      // 3. Back Fence Top Rail
      {
        type: 'Back Fence Rail',
        start: new THREE.Vector3(-24, 3.0, -24),
        end: new THREE.Vector3(24, 3.0, -24),
        radius: 0.35
      },
      // 4. Left Fence Top Rail
      {
        type: 'Left Fence Rail',
        start: new THREE.Vector3(-24, 3.0, -24),
        end: new THREE.Vector3(-24, 3.0, 15),
        radius: 0.35
      },
      // 5. Right Fence Top Rail
      {
        type: 'Right Fence Rail',
        start: new THREE.Vector3(24, 3.0, -24),
        end: new THREE.Vector3(24, 3.0, 15),
        radius: 0.35
      },
      // 6. Overhead Power Wire
      {
        type: 'Power Wire Rail',
        start: new THREE.Vector3(-22, 11.5, 8),
        end: new THREE.Vector3(22, 11.5, 8),
        radius: 0.25
      }
    ];

    for (let b of branches) {
      const lineVec = b.end.clone().sub(b.start);
      const lineLen = lineVec.length();
      const lineDir = lineVec.clone().normalize();

      const posVec = position.clone().sub(b.start);
      const projLen = posVec.dot(lineDir);

      if (projLen >= 0 && projLen <= lineLen) {
        const closestPt = b.start.clone().addScaledVector(lineDir, projLen);
        const dist = position.distanceTo(closestPt);

        if (dist <= b.radius + 1.2) {
          return {
            onBranch: true,
            type: b.type,
            origin: b.start,
            direction: lineDir,
            length: lineLen,
            radius: b.radius,
            currentU: projLen,
            closestPoint: closestPt
          };
        }
      }
    }

    return { onBranch: false };
  }

  // Clamp player within suburban yard boundaries
  clampBoundaries(position) {
    position.x = THREE.MathUtils.clamp(position.x, -35, 35);
    position.z = THREE.MathUtils.clamp(position.z, -35, 30);
  }
}
