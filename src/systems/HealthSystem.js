// HealthSystem.js - Character Health & Damage Management
export class HealthSystem {
  constructor() {
    this.characters = new Map();
  }

  // Register a character with the health system
  registerCharacter(characterType, maxHealth = 100) {
    this.characters.set(characterType, {
      maxHealth: maxHealth,
      currentHealth: maxHealth,
      lastDamageTime: 0,
      isDead: false
    });
  }

  // Get character health data
  getCharacterHealth(characterType) {
    return this.characters.get(characterType);
  }

  // Get health as percentage (0-100)
  getHealthPercentage(characterType) {
    const health = this.characters.get(characterType);
    if (!health) return 100;
    return (health.currentHealth / health.maxHealth) * 100;
  }

  // Apply damage to a character with cooldown to prevent repeated hits
  applyDamage(characterType, damageAmount, cooldownDuration = 0.5) {
    const health = this.characters.get(characterType);
    if (!health || health.isDead) return false;

    const currentTime = Date.now() / 1000;
    
    // Check cooldown to prevent spam damage
    if (currentTime - health.lastDamageTime < cooldownDuration) {
      return false;
    }

    health.currentHealth -= damageAmount;
    health.lastDamageTime = currentTime;

    // Check if character died
    if (health.currentHealth <= 0) {
      health.currentHealth = 0;
      health.isDead = true;
      return true; // Character died
    }

    return true; // Damage applied successfully
  }

  // Heal character
  heal(characterType, healAmount) {
    const health = this.characters.get(characterType);
    if (!health) return;

    health.currentHealth = Math.min(health.currentHealth + healAmount, health.maxHealth);
    
    // Revive if healed
    if (health.isDead && health.currentHealth > 0) {
      health.isDead = false;
    }
  }

  // Reset character health to full
  resetHealth(characterType) {
    const health = this.characters.get(characterType);
    if (!health) return;

    health.currentHealth = health.maxHealth;
    health.isDead = false;
    health.lastDamageTime = 0;
  }

  // Reset all characters
  resetAllHealth() {
    for (let [key, health] of this.characters) {
      health.currentHealth = health.maxHealth;
      health.isDead = false;
      health.lastDamageTime = 0;
    }
  }

  // Check if character is dead
  isDead(characterType) {
    const health = this.characters.get(characterType);
    return health ? health.isDead : false;
  }
}
