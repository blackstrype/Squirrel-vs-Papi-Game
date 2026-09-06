import { test, describe } from 'node:test';
import assert from 'node:assert';
import { HealthSystem } from './HealthSystem.js';

describe('HealthSystem', () => {
  describe('heal()', () => {
    test('should increase currentHealth by healAmount', () => {
      const system = new HealthSystem();
      system.registerCharacter('player', 100);
      system.applyDamage('player', 30, 0);

      system.heal('player', 20);

      const health = system.getCharacterHealth('player');
      assert.strictEqual(health.currentHealth, 90);
    });

    test('should not exceed maxHealth when healing', () => {
      const system = new HealthSystem();
      system.registerCharacter('player', 100);
      system.applyDamage('player', 10, 0);

      system.heal('player', 50);

      const health = system.getCharacterHealth('player');
      assert.strictEqual(health.currentHealth, 100);
    });

    test('should ignore healing for unregistered character', () => {
      const system = new HealthSystem();
      system.heal('unknown', 20);
    });

    test('should revive a dead character if healed above 0', () => {
      const system = new HealthSystem();
      system.registerCharacter('player', 100);
      system.applyDamage('player', 100, 0);

      assert.strictEqual(system.isDead('player'), true);

      system.heal('player', 50);

      const health = system.getCharacterHealth('player');
      assert.strictEqual(health.currentHealth, 50);
      assert.strictEqual(health.isDead, false);
    });
  });
});
