import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsEngine } from './PhysicsEngine.js';

describe('PhysicsEngine', () => {
  let engine;

  beforeEach(() => {
    // Mock environment if necessary, but PhysicsEngine only takes environment and initializes raycaster
    const mockEnvironment = {};
    engine = new PhysicsEngine(mockEnvironment);
  });

  describe('clampBoundaries', () => {
    it('should not change position if within boundaries', () => {
      const position = { x: 0, y: 0, z: 0 };
      engine.clampBoundaries(position);
      expect(position.x).toBe(0);
      expect(position.z).toBe(0);

      const pos2 = { x: 35, y: 0, z: 30 };
      engine.clampBoundaries(pos2);
      expect(pos2.x).toBe(35);
      expect(pos2.z).toBe(30);

      const pos3 = { x: -35, y: 0, z: -35 };
      engine.clampBoundaries(pos3);
      expect(pos3.x).toBe(-35);
      expect(pos3.z).toBe(-35);
    });

    it('should clamp x position to boundaries', () => {
      const positionRight = { x: 40, y: 0, z: 0 };
      engine.clampBoundaries(positionRight);
      expect(positionRight.x).toBe(35);
      expect(positionRight.z).toBe(0);

      const positionLeft = { x: -40, y: 0, z: 0 };
      engine.clampBoundaries(positionLeft);
      expect(positionLeft.x).toBe(-35);
      expect(positionLeft.z).toBe(0);
    });

    it('should clamp z position to boundaries', () => {
      const positionForward = { x: 0, y: 0, z: 40 };
      engine.clampBoundaries(positionForward);
      expect(positionForward.x).toBe(0);
      expect(positionForward.z).toBe(30);

      const positionBack = { x: 0, y: 0, z: -40 };
      engine.clampBoundaries(positionBack);
      expect(positionBack.x).toBe(0);
      expect(positionBack.z).toBe(-35);
    });

    it('should clamp both x and z positions if both are outside boundaries', () => {
      const position = { x: 50, y: 10, z: -50 };
      engine.clampBoundaries(position);
      expect(position.x).toBe(35);
      expect(position.y).toBe(10); // y should remain unchanged
      expect(position.z).toBe(-35);
    });
  });
});
