// MiniGameManager.js - Game State, Objectives, Radar & Victory Management
import * as THREE from 'three';

export class MiniGameManager {
  constructor(playerController, environment, aiController, audioSystem) {
    this.player = playerController;
    this.env = environment;
    this.ai = aiController;
    this.audio = audioSystem;

    this.currentMode = 'sandbox'; // 'raid' | 'defense' | 'sandbox'
    this.isPlaying = false;
    this.timerSeconds = 120;
    this.timerInterval = null;

    // Minimap canvas
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.setupUIBindings();
  }

  setupUIBindings() {
    // Mode selection buttons from Main Menu modal
    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const mode = card.getAttribute('data-mode');
        this.startMode(mode);
      });
    });

    // Character switcher buttons
    document.querySelectorAll('.char-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const char = btn.getAttribute('data-char');
        this.player.switchCharacter(char);
        this.updateCharSwitcherUI(char);
      });
    });

    // Guide Modal
    const howToBtn = document.getElementById('btn-how-to-play');
    const closeGuideBtn = document.getElementById('btn-close-guide');
    const guideModal = document.getElementById('guide-modal');

    if (howToBtn && guideModal) {
      howToBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    }
    if (closeGuideBtn && guideModal) {
      closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    }

    // Restart & Main Menu buttons
    const restartBtn = document.getElementById('btn-restart');
    const menuBtn = document.getElementById('btn-menu');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.startMode(this.currentMode);
      });
    }
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.isPlaying = false;
      });
    }
  }

  updateCharSwitcherUI(activeChar) {
    document.querySelectorAll('.char-btn').forEach((btn) => {
      if (btn.getAttribute('data-char') === activeChar) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Top Left Avatar Card
    const avatar = document.getElementById('char-avatar');
    const name = document.getElementById('char-name');
    const role = document.getElementById('char-role');

    if (activeChar === 'squirrel') {
      if (avatar) avatar.textContent = '🐿️';
      if (name) name.textContent = 'Nutty the Squirrel';
      if (role) role.textContent = 'FPS Acrobatic Heist Master';
    } else if (activeChar === 'papi') {
      if (avatar) avatar.textContent = '👴';
      if (name) name.textContent = 'Papi';
      if (role) role.textContent = 'The Feeder Guardian';
    } else if (activeChar === 'racoon') {
      if (avatar) avatar.textContent = '🦝';
      if (name) name.textContent = 'Bandit the Racoon';
      if (role) role.textContent = 'Suburban Saboteur';
    }
  }

  startMode(mode) {
    this.currentMode = mode;
    this.isPlaying = true;

    // Hide Menu, Show HUD
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    const modeBadge = document.getElementById('mode-badge');
    const objTitle = document.getElementById('objective-title');
    const objDesc = document.getElementById('objective-desc');
    const timerBadge = document.getElementById('timer-badge');

    if (mode === 'raid') {
      if (modeBadge) modeBadge.textContent = 'HEIST CAMPAIGN';
      if (objTitle) objTitle.textContent = 'SQUIRREL HEIST';
      if (objDesc) objDesc.textContent = 'Raid the 3 birdfeeders & store 50 seeds in the Tree Nest!';
      if (timerBadge) timerBadge.classList.remove('hidden');
      this.timerSeconds = 180;
      this.player.switchCharacter('squirrel');
      this.player.totalSeedsStolen = 0;
    } else if (mode === 'defense') {
      if (modeBadge) modeBadge.textContent = 'PAPI DEFENSE';
      if (objTitle) objTitle.textContent = 'BACKYARD DEFENSE';
      if (objDesc) objDesc.textContent = 'Protect your birdfeeders from wildlife! Use your water hose [E]';
      if (timerBadge) timerBadge.classList.remove('hidden');
      this.timerSeconds = 120;
      this.player.switchCharacter('papi');
    } else {
      if (modeBadge) modeBadge.textContent = 'FREE ROAM FPS';
      if (objTitle) objTitle.textContent = 'NEIGHBORHOOD SANDBOX';
      if (objDesc) objDesc.textContent = 'Explore in 1st-person FPS! Try branch parkour & collect Golden Acorns!';
      if (timerBadge) timerBadge.classList.add('hidden');
      this.player.switchCharacter('squirrel');
    }

    this.updateCharSwitcherUI(this.player.activeCharacterType);
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPlaying || this.currentMode === 'sandbox') return;
      this.timerSeconds--;

      const mins = Math.floor(this.timerSeconds / 60);
      const secs = this.timerSeconds % 60;
      const text = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const el = document.getElementById('timer-text');
      if (el) el.textContent = text;

      if (this.timerSeconds <= 0) {
        this.endGame(false, 'Time expired! Papi locked down the backyard.');
      }
    }, 1000);
  }

  update(delta) {
    if (!this.isPlaying) return;

    // Check interaction with Birdfeeders
    this.checkFeederInteractions();

    // Check Nest Seed Deposit
    this.checkNestDeposit();

    // Check Golden Acorns pickup
    this.checkGoldenAcorns();

    // Toggle Subway Surfers Branch Parkour Badge
    const branchBadge = document.getElementById('branch-mode-badge');
    if (branchBadge) {
      if (this.player.onBranchMode) {
        branchBadge.classList.remove('hidden');
      } else {
        branchBadge.classList.add('hidden');
      }
    }

    // Render 2D Minimap Radar
    this.renderMinimap();

    // Update HUD Stats
    this.updateHUDStats();
  }

  checkFeederInteractions() {
    const playerPos = this.player.position;
    let nearAction = false;
    let actionText = '';

    this.env.feeders.forEach((feeder) => {
      const dist = playerPos.distanceTo(feeder.position);
      if (dist < 2.2) {
        if (this.player.activeCharacterType === 'squirrel' || this.player.activeCharacterType === 'racoon') {
          nearAction = true;
          actionText = `Press [E] to Raid ${feeder.name}`;

          if (this.player.keys['KeyE'] && feeder.seedsRemaining > 0 && this.player.seedInventory < this.player.maxSeedCapacity) {
            feeder.seedsRemaining--;
            this.player.seedInventory++;
            this.audio.playSeedPickup();
          }
        } else if (this.player.activeCharacterType === 'papi') {
          nearAction = true;
          actionText = `Press [E] to Refill ${feeder.name}`;

          if (this.player.keys['KeyE'] && feeder.seedsRemaining < feeder.maxSeeds) {
            feeder.seedsRemaining = feeder.maxSeeds;
            this.audio.playFeederRefill();
          }
        }
      }
    });

    const prompt = document.getElementById('action-prompt');
    const textEl = document.getElementById('action-text');
    if (prompt && textEl) {
      if (nearAction) {
        prompt.classList.remove('hidden');
        textEl.textContent = actionText;
      } else {
        prompt.classList.add('hidden');
      }
    }
  }

  checkNestDeposit() {
    if (this.player.activeCharacterType === 'squirrel' && this.player.seedInventory > 0) {
      const distToNest = this.player.position.distanceTo(this.env.nestPosition);
      if (distToNest < 2.5) {
        this.player.totalSeedsStolen += this.player.seedInventory;
        this.player.seedInventory = 0;
        this.audio.playAcornCollect();

        if (this.currentMode === 'raid' && this.player.totalSeedsStolen >= 50) {
          this.endGame(true, 'Nutty successfully raided Papi\'s feeders and stored 50 seeds!');
        }
      }
    }
  }

  checkGoldenAcorns() {
    this.env.goldenAcorns.forEach((acorn) => {
      if (!acorn.collected && this.player.position.distanceTo(acorn.position) < 1.5) {
        acorn.collected = true;
        acorn.mesh.visible = false;
        this.player.goldenAcornsCollected++;
        this.audio.playAcornCollect();

        const countEl = document.getElementById('golden-acorn-count');
        if (countEl) countEl.textContent = `${this.player.goldenAcornsCollected} / 10`;

        if (this.player.goldenAcornsCollected >= 10 && this.currentMode === 'sandbox') {
          this.endGame(true, 'Master Heist Accomplished! All 10 Golden Acorns collected!');
        }
      }
    });
  }

  updateHUDStats() {
    const statLabel = document.getElementById('primary-stat-label');
    const statText = document.getElementById('primary-stat-text');
    const statFill = document.getElementById('primary-stat-fill');

    if (this.player.activeCharacterType === 'squirrel') {
      if (statLabel) statLabel.textContent = 'Pouch Seeds';
      if (statText) statText.textContent = `${this.player.seedInventory} / ${this.player.maxSeedCapacity} (Total: ${this.player.totalSeedsStolen})`;
      if (statFill) statFill.style.width = `${(this.player.seedInventory / this.player.maxSeedCapacity) * 100}%`;
    } else {
      if (statLabel) statLabel.textContent = 'Water Hose Pressure';
      if (statText) statText.textContent = '100% Ready';
      if (statFill) statFill.style.width = '100%';
    }
  }

  renderMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = 140;
    const h = 140;
    const center = w / 2;
    const scale = 2.2;

    ctx.clearRect(0, 0, w, h);

    // Background Yard Ground
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, w, h);

    // House footprint
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(center - 18, center - 6, 36, 24);

    // Oak Tree Nest
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(center, center - 20, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Birdfeeders (Orange Dots)
    this.env.feeders.forEach((f) => {
      const fx = center + f.position.x * scale * 0.8;
      const fz = center + f.position.z * scale * 0.8;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(fx, fz, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player Dot (Cyan)
    const px = center + this.player.position.x * scale * 0.8;
    const pz = center + this.player.position.z * scale * 0.8;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, pz, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  endGame(victory, message) {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    const score = document.getElementById('result-score');

    if (victory) {
      if (title) title.textContent = '🏆 VICTORY!';
      this.audio.playVictory();
    } else {
      if (title) title.textContent = '⌛ TIME UP!';
    }

    if (msg) msg.textContent = message;
    if (score) score.textContent = this.player.totalSeedsStolen;
    if (modal) modal.classList.remove('hidden');
  }
}
