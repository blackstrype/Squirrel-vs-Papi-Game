// PhysicsEngine.js - Collision, Raycasting & Solid Object Physics
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

  // Check if position is near climbable Tree Trunk
  checkTreeClimbing(position) {
    const treeCenter = new THREE.Vector2(0, -14);
    const pos2D = new THREE.Vector2(position.x, position.z);
    const dist = pos2D.distanceTo(treeCenter);

    if (dist < 2.8 && position.y <= 9.0) {
      return { canClimb: true, treeCenter, dist };
    }
    return { canClimb: false };
  }

  // Check if position is near climbable Fence
  checkFenceClimbing(position) {
    // Back Fence (z = -24)
    if (Math.abs(position.z - (-24)) < 1.2 && position.x >= -24.5 && position.x <= 24.5 && position.y <= 3.2) {
      return { canClimb: true, topY: 3.0, fenceZ: -24 };
    }
    // Left Fence (x = -24)
    if (Math.abs(position.x - (-24)) < 1.2 && position.z >= -24.5 && position.z <= 15.5 && position.y <= 3.2) {
      return { canClimb: true, topY: 3.0, fenceX: -24 };
    }
    // Right Fence (x = 24)
    if (Math.abs(position.x - 24) < 1.2 && position.z >= -24.5 && position.z <= 15.5 && position.y <= 3.2) {
      return { canClimb: true, topY: 3.0, fenceX: 24 };
    }

    return { canClimb: false };
  }

  // Solid Object Collision Response (House Walls, Shed Walls, Tree Trunk, Fences)
  resolveSolidCollisions(position, playerRadius = 0.4, isClimbing = false, onBranchMode = false) {
    if (onBranchMode) return;

    // 1. House Solid Bounding Box
    // House bounds: x [-8.0, 8.0], z [-4.0, 8.0], y [0, 8.0]
    if (position.y < 8.0) {
      const minX = -8.0 - playerRadius;
      const maxX = 8.0 + playerRadius;
      const minZ = -4.0 - playerRadius;
      const maxZ = 8.0 + playerRadius;

      if (position.x > minX && position.x < maxX && position.z > minZ && position.z < maxZ) {
        const dx1 = position.x - minX;
        const dx2 = maxX - position.x;
        const dz1 = position.z - minZ;
        const dz2 = maxZ - position.z;

        const minDist = Math.min(dx1, dx2, dz1, dz2);
        if (minDist === dx1) position.x = minX;
        else if (minDist === dx2) position.x = maxX;
        else if (minDist === dz1) position.z = minZ;
        else if (minDist === dz2) position.z = maxZ;
      }
    }

    // 2. Garden Shed Solid Box
    // Shed bounds: x [-19.0, -13.0], z [-19.0, -13.0], y [0, 4.5]
    if (position.y < 4.5) {
      const minX = -19.0 - playerRadius;
      const maxX = -13.0 + playerRadius;
      const minZ = -19.0 - playerRadius;
      const maxZ = -13.0 + playerRadius;

      if (position.x > minX && position.x < maxX && position.z > minZ && position.z < maxZ) {
        const dx1 = position.x - minX;
        const dx2 = maxX - position.x;
        const dz1 = position.z - minZ;
        const dz2 = maxZ - position.z;

        const minDist = Math.min(dx1, dx2, dz1, dz2);
        if (minDist === dx1) position.x = minX;
        else if (minDist === dx2) position.x = maxX;
        else if (minDist === dz1) position.z = minZ;
        else if (minDist === dz2) position.z = maxZ;
      }
    }

    // 3. Oak Tree Trunk Solid Cylinder (Only when NOT climbing tree)
    if (!isClimbing && position.y < 8.5) {
      const treeCenter = new THREE.Vector2(0, -14);
      const pos2D = new THREE.Vector2(position.x, position.z);
      const dist = pos2D.distanceTo(treeCenter);
      const minRadius = 1.4 + playerRadius;

      if (dist < minRadius && dist > 0.001) {
        const pushDir = pos2D.sub(treeCenter).normalize();
        position.x = treeCenter.x + pushDir.x * minRadius;
        position.z = treeCenter.y + pushDir.y * minRadius;
      }
    }

    // 4. Perimeter Fences
    if (!isClimbing) {
      // Back Fence z = -24
      if (Math.abs(position.z - (-24)) < 0.8 && position.x >= -24.5 && position.x <= 24.5 && position.y < 2.8) {
        position.z = -24.0 + (playerRadius + 0.3);
      }
      // Left Fence x = -24
      if (Math.abs(position.x - (-24)) < 0.8 && position.z >= -24.5 && position.z <= 15.5 && position.y < 2.8) {
        position.x = -24.0 + (playerRadius + 0.3);
      }
      // Right Fence x = 24
      if (Math.abs(position.x - 24) < 0.8 && position.z >= -24.5 && position.z <= 15.5 && position.y < 2.8) {
        position.x = 24.0 - (playerRadius + 0.3);
      }
    }
  }

  // Detect Subway Surfers style Branch / Rail surfaces
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
