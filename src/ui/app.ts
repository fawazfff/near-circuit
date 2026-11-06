/**
 * NEAR CIRCUIT - UI & APPLICATION CONTROLLER
 * Connects the Racing Canvas Engine, Track 09 Autonomous Merchant Pricing Engine,
 * NEP-245 Multi-Token Inventory, and NEAR Academy.
 */

import { NPCMerchant, PlayerState, EconomyHistoryPoint, TokenId } from '../types';
import { 
  INITIAL_MERCHANTS, 
  recalculateMerchantPricing, 
  executePurchase, 
  investInMerchant, 
  simulateEconomyDay 
} from '../economy/pricingEngine';
import { NEP245_CATALOG, NEP245MultiTokenContract, generateSessionKey } from '../contracts/nep245';
import { ACADEMY_LESSONS } from '../content/nearAcademy';
import { RacingEngine, RaceTelemetry } from '../game/racingEngine';

export class AppController {
  private root: HTMLElement;
  private currentScreen: 'race' | 'market' | 'academy' | 'inventory' = 'race';
  
  // Game & Economy State
  private merchants: Record<string, NPCMerchant> = { ...INITIAL_MERCHANTS };
  private player: PlayerState;
  private contract: NEP245MultiTokenContract;
  private currentDay: number = 1;
  private economyHistory: EconomyHistoryPoint[] = [];
  private simulationLogs: string[] = [
    'Paddock initialized on NEAR testnet.',
    'Session Key active (ed25519:6c2e...88a1) with 0.5 NEAR gas allowance.',
    '3 autonomous merchant agents monitoring track demand.'
  ];

  // Academy state
  private selectedLessonIndex: number = 0;
  private completedLessons: Set<string> = new Set();

  // Racing engine
  private engine: RacingEngine | null = null;
  private telemetryInterval: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.contract = new NEP245MultiTokenContract();
    
    // Initialize player state
    const { sessionKey } = generateSessionKey('player.circuit.near');
    this.player = {
      nearAccountId: 'player.circuit.near',
      sessionKey,
      nearBalance: 24.5,
      inventory: {
        item_nos: 2,
        item_slicks: 2,
        item_turbo: 0,
        share_marcus: 0,
        share_elena: 0,
        share_dex: 0
      },
      car: {
        name: 'Viper Drift NC-01',
        topSpeed: 280,
        acceleration: 190,
        handling: 85,
        nosLevel: 100,
        tireGrip: 100,
        installedTurbo: false
      },
      stats: {
        racesCompleted: 0,
        racesWon: 0,
        totalEarnedNear: 0,
        totalSpentNear: 0
      }
    };

    // Load initial economy history point
    this.economyHistory.push({
      day: 1,
      nosPrice: this.merchants.marcus.currentPrice,
      tiresPrice: this.merchants.elena.currentPrice,
      turboPrice: this.merchants.dex.currentPrice,
      totalMarketVolume: 9,
      marcusBalance: this.merchants.marcus.walletBalanceNear,
      elenaBalance: this.merchants.elena.walletBalanceNear,
      dexBalance: this.merchants.dex.walletBalanceNear
    });

    this.setupGlobalKeyListeners();
    this.render();
  }

  private setupGlobalKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.engine) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.engine.input.throttle = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.engine.input.brake = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.engine.input.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.engine.input.right = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.engine.input.boost = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.engine) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.engine.input.throttle = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.engine.input.brake = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.engine.input.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.engine.input.right = false;
      if (e.code === 'Space') this.engine.input.boost = false;
    });
  }

  public navigateTo(screen: 'race' | 'market' | 'academy' | 'inventory') {
    if (this.currentScreen === 'race' && this.engine) {
      this.engine.stop();
      if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    }
    this.currentScreen = screen;
    this.render();
  }

  public render() {
    this.root.innerHTML = `
      <div class="app-container">
        <!-- SIDEBAR -->
        <aside class="sidebar">
          <div class="brand-header">
            <div class="brand-icon">⚡</div>
            <div class="brand-title">
              NEAR CIRCUIT
              <span>AUTONOMOUS DRIFT ECONOMY</span>
            </div>
          </div>

          <div class="nav-label">UNDERGROUND LEAGUE</div>
          <button class="nav-btn ${this.currentScreen === 'race' ? 'active' : ''}" id="nav-race">
            🏁 <span>Race Circuit</span>
          </button>
          <button class="nav-btn ${this.currentScreen === 'market' ? 'active' : ''}" id="nav-market">
            🏪 <span>Autonomous Garages</span>
            <span class="nav-badge">3 AGENTS</span>
          </button>
          <button class="nav-btn ${this.currentScreen === 'inventory' ? 'active' : ''}" id="nav-inventory">
            🎒 <span>NEP-245 Trunk</span>
          </button>

          <div class="nav-label">KNOWLEDGE BASE</div>
          <button class="nav-btn ${this.currentScreen === 'academy' ? 'active' : ''}" id="nav-academy">
            🎓 <span>NEAR Academy</span>
            <span class="nav-badge">${this.completedLessons.size}/5</span>
          </button>

          <div class="sidebar-footer">
            <div class="session-key-pill">⚡ SESSION KEY ACTIVE · 0 POPUPS</div>
            <div class="wallet-display">
              <span class="wallet-label">Driver Balance:</span>
              <span class="wallet-value">${this.player.nearBalance.toFixed(2)} <span>NEAR</span></span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; font-family: monospace;">
              ${this.player.nearAccountId}
            </div>
          </div>
        </aside>

        <!-- MAIN STAGE -->
        <main class="main-stage">
          <header class="top-bar">
            <div class="page-title">
              ${this.getScreenTitle()}
            </div>
            <div class="top-bar-stats">
              <div class="stat-chip">
                <span>RACES:</span>
                <b>${this.player.stats.racesWon} W / ${this.player.stats.racesCompleted} T</b>
              </div>
              <div class="stat-chip">
                <span>PADDOCK DAY:</span>
                <b>DAY ${this.currentDay}</b>
              </div>
              <button class="btn-primary" id="btn-quick-race" style="padding: 8px 16px; font-size: 12px;">
                ⚡ QUICK SPRINT
              </button>
            </div>
          </header>

          <div class="page-view">
            ${this.renderCurrentView()}
          </div>
        </main>
      </div>
    `;

    this.bindEvents();

    if (this.currentScreen === 'race') {
      this.initRacingCanvas();
    }
  }

  private getScreenTitle(): string {
    switch (this.currentScreen) {
      case 'race': return '🏁 NEON DOWNTOWN SPRINT · 4.5 KM CIRCUIT';
      case 'market': return '🏪 AUTONOMOUS PADDOCK GARAGES · TRACK 09 ECONOMY';
      case 'academy': return '🎓 NEAR PROTOCOL RACER ACADEMY';
      case 'inventory': return '🎒 NEP-245 MULTI-TOKEN MASTER TRUNK';
    }
  }

  private renderCurrentView(): string {
    switch (this.currentScreen) {
      case 'race': return this.renderRaceView();
      case 'market': return this.renderMarketView();
      case 'academy': return this.renderAcademyView();
      case 'inventory': return this.renderInventoryView();
    }
  }

  // --- 1. RACE VIEW ---
  private renderRaceView(): string {
    const hasNos = this.player.inventory.item_nos > 0;
    const hasSlicks = this.player.inventory.item_slicks > 0;
    const hasTurbo = this.player.car.installedTurbo || this.player.inventory.item_turbo > 0;

    return `
      <div class="race-layout">
        <!-- Live HUD Telemetry -->
        <div class="race-hud-bar">
          <div class="hud-card">
            <div class="hud-label">Velocity</div>
            <div class="hud-value" id="hud-speed">000 <span>KM/H</span></div>
          </div>
          <div class="hud-card">
            <div class="hud-label">Distance to Finish</div>
            <div class="hud-value" id="hud-distance">0 <span>/ 4,500 M</span></div>
          </div>
          <div class="hud-card">
            <div class="hud-label">NOS Boost Reserve</div>
            <div class="hud-value" id="hud-boost" style="color: var(--cyan);">100%</div>
          </div>
          <div class="hud-card">
            <div class="hud-label">Tire Grip</div>
            <div class="hud-value" id="hud-grip" style="color: var(--near-green);">100%</div>
          </div>
          <div class="hud-card">
            <div class="hud-label">NEAR Shards Picked</div>
            <div class="hud-value" id="hud-shards" style="color: var(--yellow);">0 <span>◈</span></div>
          </div>
        </div>

        <!-- Canvas -->
        <div class="canvas-container">
          <canvas id="race-canvas" width="1020" height="480"></canvas>
          <div class="race-overlay-ui">
            <div class="track-tag">SHARD 0 · NEON CITY SPRINT</div>
            <div class="track-tag" style="border-color: var(--near-green); color: var(--near-green);">
              EQUIPPED: ${hasTurbo ? 'STAGE-2 TURBO' : 'STOCK ENGINE'} · ${hasNos ? 'NOS LOADED' : 'NO NOS'}
            </div>
          </div>
        </div>

        <!-- Controls & Ignition -->
        <div class="race-controls-panel">
          <div class="control-tips">
            <span><b class="key-badge">W / ↑</b> Accelerate</span>
            <span><b class="key-badge">S / ↓</b> Brake</span>
            <span><b class="key-badge">A / D / ← →</b> Steer / Drift</span>
            <span><b class="key-badge">SPACE</b> Nitro Blast</span>
          </div>

          <div style="display: flex; gap: 12px;">
            <button class="btn-secondary" id="btn-reset-race">↺ RESTART</button>
            <button class="btn-primary" id="btn-start-race">⚡ LAUNCH (GAS)</button>
          </div>
        </div>

        <!-- On-Screen Touch / Click Buttons (Mobile Friendly) -->
        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 4px;" class="touch-bar">
          <button class="btn-secondary" id="touch-left" style="padding: 14px 24px; font-size: 16px;">◀ STEER LEFT</button>
          <button class="btn-secondary" id="touch-brake" style="padding: 14px 24px; font-size: 16px;">🛑 BRAKE</button>
          <button class="btn-primary" id="touch-gas" style="padding: 14px 28px; font-size: 16px;">⚡ GAS</button>
          <button class="btn-secondary" id="touch-right" style="padding: 14px 24px; font-size: 16px;">STEER RIGHT ▶</button>
          <button class="btn-primary" id="touch-nos" style="background: var(--cyan); color: #000; padding: 14px 24px; font-size: 16px;">🔥 NOS</button>
        </div>
      </div>
    `;
  }

  private initRacingCanvas() {
    const canvas = document.getElementById('race-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    this.engine = new RacingEngine(canvas);
    
    // Configure based on player's NEP-245 inventory
    const hasTurbo = this.player.car.installedTurbo || this.player.inventory.item_turbo > 0;
    const hasSlicks = this.player.inventory.item_slicks > 0;
    this.engine.resetRace(hasTurbo, hasSlicks);

    // Wire up finish callback
    this.engine.setOnFinish((telemetry: RaceTelemetry) => {
      this.handleRaceFinished(telemetry);
    });

    // Wire telemetry update loop
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    this.telemetryInterval = window.setInterval(() => {
      if (!this.engine) return;
      const t = this.engine.getTelemetry();
      
      const elSpeed = document.getElementById('hud-speed');
      const elDist = document.getElementById('hud-distance');
      const elBoost = document.getElementById('hud-boost');
      const elGrip = document.getElementById('hud-grip');
      const elShards = document.getElementById('hud-shards');

      if (elSpeed) elSpeed.innerHTML = `${String(t.speedKmh).padStart(3, '0')} <span>KM/H</span>`;
      if (elDist) elDist.innerHTML = `${t.distanceMeters} <span>/ ${t.trackLengthMeters} M</span>`;
      if (elBoost) elBoost.textContent = `${t.boostPercent}%`;
      if (elGrip) elGrip.textContent = `${100 - t.tireWearPercent}%`;
      if (elShards) elShards.innerHTML = `${t.nearShardsCollected} <span>◈</span>`;
    }, 50);
  }

  private handleRaceFinished(telemetry: RaceTelemetry) {
    const purseRewardNear = 3.5;
    const shardBonusNear = telemetry.nearShardsCollected * 0.25;
    const totalWon = purseRewardNear + shardBonusNear;

    this.player.nearBalance += totalWon;
    this.player.stats.racesCompleted++;
    this.player.stats.racesWon++;
    this.player.stats.totalEarnedNear += totalWon;

    // Consume 1x NOS and 1x Tire wear if player had them
    if (this.player.inventory.item_nos > 0) this.player.inventory.item_nos--;
    if (this.player.inventory.item_slicks > 0) this.player.inventory.item_slicks--;

    alert(`🏁 VICTORY CROSSING!\n\n` +
      `Lap Time: ${telemetry.lapTimeSeconds}s\n` +
      `Purse Prize: +${purseRewardNear} NEAR\n` +
      `Shards Collected: +${shardBonusNear.toFixed(2)} NEAR\n` +
      `Total Reward: +${totalWon.toFixed(2)} NEAR credited via Session Key (0 popups)!\n` +
      `1x NOS & Tire set consumed during high-speed heat.`);

    this.render();
  }

  // --- 2. AUTONOMOUS GARAGES & MARKET VIEW (TRACK 09 REQUIREMENT) ---
  private renderMarketView(): string {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
          <div>
            <p style="color: var(--cyan); font-weight: 700; font-size: 13px; letter-spacing: 0.1em;">
              TRACK 09: GAMES WITH REAL ECONOMIES
            </p>
            <h1 style="font-size: 28px; margin-top: 4px;">The Autonomous Paddock Market</h1>
          </div>
          <div style="color: var(--text-muted); font-size: 14px;">
            Pricing Rules: <code style="color: var(--near-green);">src/economy/pricingEngine.ts</code>
          </div>
        </div>
        <p style="color: var(--text-muted); max-width: 820px; font-size: 14px; line-height: 1.5;">
          Every mechanic is an autonomous AI agent with their own testnet account and inventory. 
          If racers flood the market or buy out supplies, bonding curves dynamically surge or slash prices.
          If an NPC goes broke paying paddock bay rent, their garage shutters until you inject bailout capital!
        </p>

        <!-- The 3 Autonomous Merchant Cards -->
        <div class="market-grid">
          ${Object.values(this.merchants).map(m => this.renderMerchantCard(m)).join('')}
        </div>

        <!-- 7-Day Fast Forward Simulator Panel -->
        <div class="simulator-panel">
          <div class="simulator-header">
            <div>
              <h3 style="font-size: 18px; color: #fff;">Judge Time-Warp Simulator (7 Days in 1 Click)</h3>
              <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
                Simulates 100+ autonomous AI racers, fuel consumption, garage rent deductions, and dynamic price moves.
              </p>
            </div>
            <button class="btn-primary" id="btn-fast-forward">
              ⏩ FAST-FORWARD 7 DAYS (SIMULATE)
            </button>
          </div>

          <!-- Dynamic Price Trend Sparklines -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 12px 0;">
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 11px; color: var(--text-muted);">MARCUS NOS PRICE</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--yellow); font-family: Orbitron;">
                ${this.merchants.marcus.currentPrice.toFixed(2)} NEAR
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 11px; color: var(--text-muted);">ELENA TIRES PRICE</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--yellow); font-family: Orbitron;">
                ${this.merchants.elena.currentPrice.toFixed(2)} NEAR
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 11px; color: var(--text-muted);">DEX TURBO PRICE</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--yellow); font-family: Orbitron;">
                ${this.merchants.dex.bankrupt ? 'SHUTTERED' : `${this.merchants.dex.currentPrice.toFixed(2)} NEAR`}
              </div>
            </div>
          </div>

          <!-- Live Log Terminal -->
          <div class="sim-log-terminal">
            ${this.simulationLogs.map(l => `<div>› ${l}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderMerchantCard(m: NPCMerchant): string {
    const isBankrupt = m.bankrupt;

    return `
      <article class="merchant-card ${isBankrupt ? 'bankrupt-card' : ''}">
        <div class="card-top-row">
          <div>
            <div class="merchant-name">${m.name}</div>
            <div class="merchant-callsign">${m.callsign}</div>
          </div>
          <div class="account-tag">${m.nearAccountId}</div>
        </div>

        <div class="wallet-balance-row">
          <span>Agent Wallet:</span>
          <b>${m.walletBalanceNear.toFixed(2)} NEAR</b>
        </div>

        <!-- Transparent AI Reasoning Tooltip / Card (Track 09 Core Requirement) -->
        <div class="reasoning-box">
          <div class="reasoning-title">
            <span>🔍 PRICING REASONING</span>
            <span>${m.reasoning.lastPriceAdjustmentPercent >= 0 ? '+' : ''}${m.reasoning.lastPriceAdjustmentPercent}%</span>
          </div>
          <p class="reasoning-text">
            <strong>${m.reasoning.headline}:</strong> ${m.reasoning.explanation}
          </p>
          <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted); font-family: monospace;">
            Supply Ratio: ${(m.reasoning.inventoryRatio * 100).toFixed(0)}% | Demand Index: ${m.reasoning.demandFactor}x
          </div>
        </div>

        <!-- Item Buying Section -->
        <div class="item-buy-section">
          <div class="item-title">${m.primaryItemName}</div>
          <div class="item-desc">${NEP245_CATALOG[m.primaryItemId]?.description || ''}</div>
          
          <div class="price-row">
            <div class="price-tag">${isBankrupt ? 'CLOSED' : `${m.currentPrice.toFixed(2)} NEAR`}</div>
            <div class="stock-tag">STOCK: ${m.inventoryCount} / ${m.maxInventory}</div>
          </div>

          ${isBankrupt ? `
            <button class="btn-primary" style="background: var(--danger); width: 100%; justify-content: center;"
              data-action="bailout" data-merchant-id="${m.id}">
              🚨 BAIL OUT GARAGE (25 NEAR)
            </button>
          ` : `
            <button class="btn-primary" style="width: 100%; justify-content: center;"
              data-action="buy-item" data-merchant-id="${m.id}">
              1-CLICK BUY (SESSION KEY)
            </button>
          `}

          ${m.playerEquityPercent > 0 ? `
            <div style="margin-top: 8px; font-size: 11px; color: var(--near-green); text-align: center; font-weight: 700;">
              ✓ You own ${m.playerEquityPercent}% syndicate royalty equity in this shop
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  // --- 3. ACADEMY VIEW ---
  private renderAcademyView(): string {
    const lesson = ACADEMY_LESSONS[this.selectedLessonIndex];
    const isCompleted = this.completedLessons.has(lesson.id);

    return `
      <div>
        <h1 style="font-size: 28px; margin-bottom: 6px;">NEAR Racer Academy</h1>
        <p style="color: var(--text-muted); font-size: 14px;">
          Master the technical architecture of the NEAR Protocol through high-performance racing mechanics.
        </p>

        <div class="academy-grid">
          <!-- Lesson Sidebar -->
          <div class="lesson-menu">
            ${ACADEMY_LESSONS.map((l, idx) => `
              <button class="lesson-item-btn ${idx === this.selectedLessonIndex ? 'active' : ''}"
                data-action="select-lesson" data-index="${idx}">
                <div style="font-size: 11px; font-weight: 700; color: var(--cyan); font-family: monospace;">
                  MISSION ${l.number} · ${this.completedLessons.has(l.id) ? '✓ COMPLETED' : 'INCOMPLETE'}
                </div>
                <div style="font-weight: 700; font-size: 14px; margin-top: 4px; color: #fff;">
                  ${l.title}
                </div>
              </button>
            `).join('')}
          </div>

          <!-- Lesson Detail -->
          <div class="lesson-detail-card">
            <div class="lesson-category-tag">${lesson.category}</div>
            <h2 class="lesson-title-big">${lesson.title}</h2>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">${lesson.summary}</p>

            <div class="analogy-callout">
              <strong style="color: var(--magenta); display: block; margin-bottom: 4px; font-family: Orbitron; font-size: 12px;">
                🏎️ THE RACING ANALOGY
              </strong>
              ${lesson.racingAnalogy}
            </div>

            <div style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              <strong style="color: var(--near-green); display: block; margin-bottom: 6px; font-family: Orbitron; font-size: 12px;">
                ⚙️ UNDER THE HOOD: NEAR PROTOCOL
              </strong>
              ${lesson.nearConcept}
            </div>

            <!-- Hands-on Interactive Experiment -->
            <div class="experiment-box">
              <span style="font-size: 11px; font-weight: 700; color: var(--near-green); font-family: monospace;">
                INTERACTIVE SANDBOX EXPERIMENT
              </span>
              <p style="font-size: 14px; margin: 8px 0 14px 0; color: #fff;">${lesson.interactiveDemo.prompt}</p>
              <button class="btn-secondary" id="btn-run-experiment">${lesson.interactiveDemo.actionLabel}</button>
              <div id="experiment-output" style="margin-top: 12px; font-size: 13px; font-family: monospace; color: var(--cyan); display: none;">
                › ${lesson.interactiveDemo.resultText}
              </div>
            </div>

            <!-- Mastery Quiz -->
            <div class="quiz-card">
              <span style="font-size: 11px; font-weight: 700; color: var(--yellow); font-family: monospace;">
                MASTERY KNOWLEDGE CHECK
              </span>
              <h3 style="font-size: 16px; margin: 8px 0 14px 0; color: #fff;">${lesson.quiz.question}</h3>
              <div>
                ${lesson.quiz.options.map((opt, optIdx) => `
                  <button class="quiz-option-btn" data-action="answer-quiz" data-opt-idx="${optIdx}">
                    ${opt}
                  </button>
                `).join('')}
              </div>
              <div id="quiz-feedback" style="margin-top: 14px; font-size: 14px; font-weight: 600; display: none;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- 4. INVENTORY VIEW (NEP-245 STANDARD) ---
  private renderInventoryView(): string {
    return `
      <div>
        <h1 style="font-size: 28px; margin-bottom: 6px;">NEP-245 Multi-Token Trunk</h1>
        <p style="color: var(--text-muted); font-size: 14px;">
          Contract Address: <code style="color: var(--near-green);">circuit-items.game.near</code>
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px;">
          ${(Object.keys(this.player.inventory) as TokenId[]).map(tokenId => {
            const item = NEP245_CATALOG[tokenId];
            const count = this.player.inventory[tokenId];
            return `
              <div class="hud-card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; color: var(--cyan); font-weight: 700; font-family: monospace;">
                    ${item?.category.toUpperCase()}
                  </span>
                  <span style="font-size: 18px; font-family: Orbitron; font-weight: 800; color: var(--near-green);">
                    x${count}
                  </span>
                </div>
                <h3 style="font-size: 16px; margin: 10px 0 6px 0; color: #fff;">${item?.name}</h3>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">${item?.description}</p>
                <div style="margin-top: 14px; font-size: 12px; font-weight: 700; color: var(--yellow);">
                  EFFECT: ${item?.effect}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- EVENT BINDING ---
  private bindEvents() {
    // Navigation
    document.getElementById('nav-race')?.addEventListener('click', () => this.navigateTo('race'));
    document.getElementById('nav-market')?.addEventListener('click', () => this.navigateTo('market'));
    document.getElementById('nav-academy')?.addEventListener('click', () => this.navigateTo('academy'));
    document.getElementById('nav-inventory')?.addEventListener('click', () => this.navigateTo('inventory'));
    document.getElementById('btn-quick-race')?.addEventListener('click', () => this.navigateTo('race'));

    // Race buttons
    document.getElementById('btn-start-race')?.addEventListener('click', () => {
      if (this.engine) {
        this.engine.start();
        this.engine.input.throttle = true;
      }
    });

    document.getElementById('btn-reset-race')?.addEventListener('click', () => {
      if (this.engine) {
        const hasTurbo = this.player.car.installedTurbo || this.player.inventory.item_turbo > 0;
        const hasSlicks = this.player.inventory.item_slicks > 0;
        this.engine.resetRace(hasTurbo, hasSlicks);
        this.engine.start();
      }
    });

    // Touch Controls
    const bindTouch = (id: string, prop: 'throttle' | 'brake' | 'left' | 'right' | 'boost') => {
      const el = document.getElementById(id);
      if (!el) return;
      const setInput = (val: boolean) => {
        if (this.engine) {
          if (val && !this.engine.isRunning) this.engine.start();
          this.engine.input[prop] = val;
        }
      };
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); setInput(true); });
      el.addEventListener('pointerup', (e) => { e.preventDefault(); setInput(false); });
      el.addEventListener('pointerleave', (e) => { e.preventDefault(); setInput(false); });
    };

    bindTouch('touch-gas', 'throttle');
    bindTouch('touch-brake', 'brake');
    bindTouch('touch-left', 'left');
    bindTouch('touch-right', 'right');
    bindTouch('touch-nos', 'boost');

    // Market Purchase Buttons
    this.root.querySelectorAll<HTMLElement>('[data-action="buy-item"]').forEach(el => {
      el.addEventListener('click', () => {
        const merchantId = el.dataset.merchantId;
        if (!merchantId) return;
        this.handleBuyItem(merchantId);
      });
    });

    // Market Bailout Buttons
    this.root.querySelectorAll<HTMLElement>('[data-action="bailout"]').forEach(el => {
      el.addEventListener('click', () => {
        const merchantId = el.dataset.merchantId;
        if (!merchantId) return;
        this.handleBailout(merchantId);
      });
    });

    // Fast Forward Simulator
    document.getElementById('btn-fast-forward')?.addEventListener('click', () => {
      this.handleFastForward();
    });

    // Academy Selection
    this.root.querySelectorAll<HTMLElement>('[data-action="select-lesson"]').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedLessonIndex = Number(el.dataset.index);
        this.render();
      });
    });

    // Academy Experiment runner
    document.getElementById('btn-run-experiment')?.addEventListener('click', () => {
      const out = document.getElementById('experiment-output');
      if (out) out.style.display = 'block';
    });

    // Academy Quiz
    this.root.querySelectorAll<HTMLElement>('[data-action="answer-quiz"]').forEach(el => {
      el.addEventListener('click', () => {
        const choice = Number(el.dataset.optIdx);
        this.handleQuizAnswer(choice);
      });
    });
  }

  private handleBuyItem(merchantId: string) {
    const merchant = this.merchants[merchantId];
    if (!merchant) return;

    const result = executePurchase(merchant, this.player.nearBalance);
    if (!result.success) {
      alert(`⚠️ ${result.message}`);
      return;
    }

    this.player.nearBalance -= result.cost;
    this.player.inventory[merchant.primaryItemId]++;
    this.merchants[merchantId] = result.updatedMerchant;

    if (result.playerDividendNear > 0) {
      this.player.nearBalance += result.playerDividendNear;
    }

    this.simulationLogs.unshift(`[BUY] Player bought 1x ${merchant.primaryItemName} for ${result.cost.toFixed(2)} NEAR.`);
    this.render();
  }

  private handleBailout(merchantId: string) {
    const merchant = this.merchants[merchantId];
    if (!merchant) return;

    const result = investInMerchant(merchant, this.player.nearBalance, 25.0);
    if (!result.success) {
      alert(`⚠️ ${result.message}`);
      return;
    }

    this.player.nearBalance -= 25.0;
    this.merchants[merchantId] = result.updatedMerchant;
    this.simulationLogs.unshift(`[BAILOUT] Player injected 25.0 NEAR bailout capital into ${merchant.name}'s garage!`);
    alert(result.message);
    this.render();
  }

  private handleFastForward() {
    let dayAcc = this.currentDay;
    for (let i = 0; i < 7; i++) {
      const sim = simulateEconomyDay(this.merchants, dayAcc);
      this.merchants = sim.updatedMerchants;
      this.economyHistory.push(sim.historyPoint);
      dayAcc++;
      for (const log of sim.logSummary) {
        this.simulationLogs.unshift(`[DAY ${dayAcc}] ${log}`);
      }
    }
    this.currentDay = dayAcc;
    this.simulationLogs.unshift(`⏩ [FAST-FORWARD] Simulated 7 days of autonomous racing trades at 100x speed.`);
    this.render();
  }

  private handleQuizAnswer(choice: number) {
    const lesson = ACADEMY_LESSONS[this.selectedLessonIndex];
    const feedback = document.getElementById('quiz-feedback');
    if (!feedback) return;

    feedback.style.display = 'block';
    if (choice === lesson.quiz.correctIndex) {
      feedback.style.color = 'var(--near-green)';
      feedback.textContent = `✓ CORRECT! ${lesson.quiz.explanation}`;
      this.completedLessons.add(lesson.id);
    } else {
      feedback.style.color = 'var(--danger)';
      feedback.textContent = `✗ NOT QUITE. ${lesson.quiz.explanation}`;
    }
  }
}
