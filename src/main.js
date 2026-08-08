// main.js - Application Entry Point & Game Render Loop
import { SceneManager } from './engine/SceneManager.js';
import { AudioSystem } from './engine/AudioSystem.js';
import { PhysicsEngine } from './engine/PhysicsEngine.js';
import { SuburbanEnvironment } from './world/SuburbanEnvironment.js';
import { CharacterFactory } from './entities/CharacterFactory.js';
import { PlayerController } from './controllers/PlayerController.js';
import { AIController } from './controllers/AIController.js';
import { MiniGameManager } from './gameplay/MiniGameManager.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) return;

    // 1. Core Systems
    this.sceneManager = new SceneManager(this.canvas);
    this.audioSystem = new AudioSystem();

    // 2. 3D Suburban Environment
    this.environment = new SuburbanEnvironment(this.sceneManager.scene);

    // 3. Physics & Raycasting Engine
    this.physics = new PhysicsEngine(this.environment);

    // 4. Character Factory
    const squirrelMesh = CharacterFactory.createSquirrel();
    const papiMesh = CharacterFactory.createPapi();
    const racoonMesh = CharacterFactory.createRacoon();

    this.sceneManager.scene.add(squirrelMesh);
    this.sceneManager.scene.add(papiMesh);
    this.sceneManager.scene.add(racoonMesh);

    // 5. Player Controller
    this.player = new PlayerController(this.sceneManager, this.physics, this.audioSystem);
    this.player.setCharacterMeshes({
      squirrel: squirrelMesh,
      papi: papiMesh,
      racoon: racoonMesh
    });

    // 6. AI Controller for Papi Patrol
    const aiPapiMesh = CharacterFactory.createPapi();
    this.ai = new AIController(this.sceneManager.scene, this.environment, this.audioSystem);
    this.ai.setAIPapiMesh(aiPapiMesh);

    // 7. MiniGame & HUD Manager
    this.miniGame = new MiniGameManager(this.player, this.environment, this.ai, this.audioSystem);

    // Clock for delta time
    this.lastTime = performance.now();

    // Start Main Game Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Update Player & Camera
    this.player.update(delta);

    // Update Autonomous AI Patrol
    this.ai.update(delta, this.player.position, this.player.activeCharacterType);

    // Update Gameplay Objectives & HUD
    this.miniGame.update(delta);

    // Render 3D Scene
    this.sceneManager.render();
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
