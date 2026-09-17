import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { PhysicsEngine } from '../PhysicsEngine.js';

describe('PhysicsEngine', () => {
  let engine;

  beforeEach(() => {
    // Mock environment if needed
    const mockEnv = {};
    engine = new PhysicsEngine(mockEnv);
  });

  describe('checkTreeClimbing', () => {
    it('should allow climbing when position is within distance and height limits', () => {
      // Tree center is (0, -14)
      // Distance limit is < 2.8, height limit is y <= 9.0
      const position = { x: 1, y: 5.0, z: -15 };
      const result = engine.checkTreeClimbing(position);

      expect(result.canClimb).toBe(true);
      expect(result.treeCenter).toBeInstanceOf(THREE.Vector2);
      expect(result.treeCenter.x).toBe(0);
      expect(result.treeCenter.y).toBe(-14);
      expect(result.dist).toBeCloseTo(Math.sqrt(1 + 1)); // dist from (1, -15) to (0, -14) is sqrt(1^2 + (-1)^2) = sqrt(2)
    });

    it('should not allow climbing when distance is >= 2.8', () => {
      // Distance from (3, -14) to (0, -14) is 3, which is > 2.8
      const position = { x: 3, y: 5.0, z: -14 };
      const result = engine.checkTreeClimbing(position);

      expect(result.canClimb).toBe(false);
      expect(result.treeCenter).toBeUndefined();
    });

    it('should not allow climbing when height (y) is > 9.0', () => {
      // Distance is valid (0), but height is 9.1
      const position = { x: 0, y: 9.1, z: -14 };
      const result = engine.checkTreeClimbing(position);

      expect(result.canClimb).toBe(false);
      expect(result.treeCenter).toBeUndefined();
    });

    it('should allow climbing exactly at the height boundary (y = 9.0)', () => {
      const position = { x: 0.5, y: 9.0, z: -14.5 };
      const result = engine.checkTreeClimbing(position);

      expect(result.canClimb).toBe(true);
    });

    it('should allow climbing near the distance boundary (dist = 2.79)', () => {
      const position = { x: 2.79, y: 5.0, z: -14 };
      const result = engine.checkTreeClimbing(position);

      expect(result.canClimb).toBe(true);
      expect(result.dist).toBeCloseTo(2.79);
    });
  });
});
