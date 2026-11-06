/**
 * NEAR CIRCUIT - HIGH PERFORMANCE ARCADE CANVAS RACING ENGINE
 * Pure HTML5 60FPS Canvas engine with retro-synthwave neon aesthetic,
 * parallax scrolling city skyline, traffic overtaking, drift physics, and nitro boost.
 */

export interface RaceInput {
  throttle: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
}

export interface RivalCar {
  x: number;
  y: number; // Lane offset (-120 to +120)
  speed: number;
  color: string;
  type: string;
}

export interface RoadPickup {
  x: number; // distance along track
  laneY: number; // -80 to +80
  type: 'shard' | 'nos';
  collected: boolean;
}

export interface RaceTelemetry {
  speedKmh: number;
  distanceMeters: number;
  trackLengthMeters: number;
  boostPercent: number;
  tireWearPercent: number;
  nearShardsCollected: number;
  finished: boolean;
  raceWon: boolean;
  lapTimeSeconds: number;
}

export class RacingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Track & Physics parameters
  public trackLength: number = 4500; // 4.5 km sprint
  public distance: number = 0;
  public speed: number = 0; // px/sec equivalent
  public maxSpeed: number = 280; // km/h
  public baseMaxSpeed: number = 280;
  public boostMaxSpeed: number = 380;
  public accelerationRate: number = 190;
  public brakingRate: number = 280;
  
  // Car position & handling
  public carLaneY: number = 0; // -130 to +130
  public carAngle: number = 0; // Drift rotation
  public boostFuel: number = 100;
  public tireGrip: number = 100;
  public shardsCollected: number = 0;

  // State flags
  public isRunning: boolean = false;
  public isFinished: boolean = false;
  public startTime: number = 0;
  public raceTime: number = 0;

  // Rivals & Pickups
  private rivals: RivalCar[] = [];
  private pickups: RoadPickup[] = [];
  private skidmarks: { x: number; y: number; alpha: number }[] = [];
  private speedLines: { x: number; y: number; length: number; speed: number }[] = [];

  // Input state
  public input: RaceInput = {
    throttle: false,
    brake: false,
    left: false,
    right: false,
    boost: false
  };

  private onFinishCallback: ((telemetry: RaceTelemetry) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;
    this.initSpeedLines();
    this.resetRace();
  }

  public setOnFinish(callback: (telemetry: RaceTelemetry) => void) {
    this.onFinishCallback = callback;
  }

  private initSpeedLines() {
    this.speedLines = [];
    for (let i = 0; i < 25; i++) {
      this.speedLines.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        length: 20 + Math.random() * 80,
        speed: 15 + Math.random() * 25
      });
    }
  }

  public resetRace(hasTurbo: boolean = false, hasSlicks: boolean = false) {
    this.distance = 0;
    this.speed = 0;
    this.carLaneY = 0;
    this.carAngle = 0;
    this.boostFuel = 100;
    this.tireGrip = hasSlicks ? 100 : 85;
    this.maxSpeed = hasTurbo ? 330 : 280;
    this.baseMaxSpeed = this.maxSpeed;
    this.boostMaxSpeed = this.maxSpeed + 90;
    this.shardsCollected = 0;
    this.isRunning = false;
    this.isFinished = false;
    this.raceTime = 0;
    this.skidmarks = [];

    // Generate rivals along the track
    this.rivals = [
      { x: 350, y: -65, speed: 180, color: '#ff2a6d', type: 'Cyber Sedan' },
      { x: 900, y: 70, speed: 210, color: '#05d9e8', type: 'Neon GT' },
      { x: 1600, y: -40, speed: 230, color: '#f5b700', type: 'Viper Drift' },
      { x: 2300, y: 55, speed: 250, color: '#9d4edd', type: 'Apex Coupe' },
      { x: 3100, y: -75, speed: 265, color: '#ff0055', type: 'Nightshade Prototype' },
      { x: 3800, y: 20, speed: 275, color: '#00ff88', type: 'Syndicate Champion' }
    ];

    // Generate road collectibles (NEAR shards & nitro canisters)
    this.pickups = [];
    for (let d = 250; d < this.trackLength - 200; d += 220) {
      const isNos = Math.random() > 0.65;
      this.pickups.push({
        x: d,
        laneY: (Math.random() - 0.5) * 160,
        type: isNos ? 'nos' : 'shard',
        collected: false
      });
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.startTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    if (!this.isFinished) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private update(dt: number) {
    if (this.isFinished) return;
    this.raceTime += dt;

    // Boost logic
    const isBoosting = this.input.boost && this.boostFuel > 0;
    if (isBoosting) {
      this.boostFuel = Math.max(0, this.boostFuel - 32 * dt);
      this.speed = Math.min(this.boostMaxSpeed, this.speed + 320 * dt);
    } else {
      // Natural slow boost recharge
      this.boostFuel = Math.min(100, this.boostFuel + 5 * dt);
    }

    // Acceleration & Braking
    if (this.input.throttle) {
      const targetSpeed = isBoosting ? this.boostMaxSpeed : this.baseMaxSpeed;
      if (this.speed < targetSpeed) {
        this.speed += this.accelerationRate * dt;
      }
    } else if (this.input.brake) {
      this.speed = Math.max(0, this.speed - this.brakingRate * dt);
    } else {
      // Road friction drag
      this.speed = Math.max(0, this.speed - 50 * dt);
    }

    // Steering & Drifting
    const steerSpeed = 220 * (this.speed / Math.max(1, this.baseMaxSpeed));
    let targetAngle = 0;
    if (this.input.left) {
      this.carLaneY = Math.max(-125, this.carLaneY - steerSpeed * dt);
      targetAngle = -0.16;
      this.addSkidmark();
      this.tireGrip = Math.max(15, this.tireGrip - 1.2 * dt);
    } else if (this.input.right) {
      this.carLaneY = Math.min(125, this.carLaneY + steerSpeed * dt);
      targetAngle = 0.16;
      this.addSkidmark();
      this.tireGrip = Math.max(15, this.tireGrip - 1.2 * dt);
    }

    // Smooth return of car angle
    this.carAngle += (targetAngle - this.carAngle) * 8 * dt;

    // Progress distance
    const metersAdvanced = (this.speed * 1000 / 3600) * dt;
    this.distance += metersAdvanced;

    // Check pickups collision
    for (const p of this.pickups) {
      if (!p.collected && Math.abs(p.x - this.distance) < 25 && Math.abs(p.laneY - this.carLaneY) < 35) {
        p.collected = true;
        if (p.type === 'shard') {
          this.shardsCollected++;
        } else {
          this.boostFuel = Math.min(100, this.boostFuel + 45);
        }
      }
    }

    // Update rival positions
    for (const rival of this.rivals) {
      rival.x += (rival.speed * 1000 / 3600) * dt;

      // Simple collision avoidance / nudge
      const dx = rival.x - this.distance;
      const dy = rival.y - this.carLaneY;
      if (Math.abs(dx) < 40 && Math.abs(dy) < 30) {
        // Nudge player speed slightly
        this.speed = Math.max(80, this.speed - 30);
        this.tireGrip = Math.max(10, this.tireGrip - 3);
      }
    }

    // Fade skidmarks
    for (let i = this.skidmarks.length - 1; i >= 0; i--) {
      this.skidmarks[i].alpha -= dt * 0.8;
      if (this.skidmarks[i].alpha <= 0) {
        this.skidmarks.splice(i, 1);
      }
    }

    // Check finish line
    if (this.distance >= this.trackLength) {
      this.isFinished = true;
      this.isRunning = false;
      if (this.onFinishCallback) {
        this.onFinishCallback(this.getTelemetry());
      }
    }
  }

  private addSkidmark() {
    if (this.speed > 130 && Math.random() > 0.4) {
      this.skidmarks.push({
        x: 180, // car anchor position on screen
        y: (this.canvas.height / 2 + 60) + this.carLaneY + (Math.random() - 0.5) * 10,
        alpha: 0.6
      });
    }
  }

  public getTelemetry(): RaceTelemetry {
    return {
      speedKmh: Math.round(this.speed),
      distanceMeters: Math.round(this.distance),
      trackLengthMeters: this.trackLength,
      boostPercent: Math.round(this.boostFuel),
      tireWearPercent: Math.round(100 - this.tireGrip),
      nearShardsCollected: this.shardsCollected,
      finished: this.isFinished,
      raceWon: this.distance >= this.trackLength,
      lapTimeSeconds: Math.round(this.raceTime * 10) / 10
    };
  }

  // --- RENDER CYCLE ---
  private render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Synthwave Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGradient.addColorStop(0, '#0a051b');
    skyGradient.addColorStop(0.6, '#1a0b36');
    skyGradient.addColorStop(1, '#ff007f');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h * 0.55);

    // 2. Retro Glowing Sun / Moon on horizon
    ctx.save();
    ctx.fillStyle = '#ffde59';
    ctx.shadowColor = '#ff5e36';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.38, 55, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal sun laser slats
    ctx.fillStyle = '#1a0b36';
    ctx.shadowBlur = 0;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(w * 0.72 - 60, h * 0.38 + i * 9, 120, 3 + i * 0.5);
    }
    ctx.restore();

    // 3. Distant Cyberpunk Skyline (Parallax)
    ctx.fillStyle = '#120826';
    const skylineOffset = (this.distance * 0.08) % 300;
    for (let x = -300; x < w + 300; x += 60) {
      const bHeight = 45 + Math.sin(x * 0.05) * 35;
      ctx.fillRect(x - skylineOffset, h * 0.55 - bHeight, 52, bHeight);
      
      // Building window lights
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x - skylineOffset + 12, h * 0.55 - bHeight + 15, 6, 8);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x - skylineOffset + 28, h * 0.55 - bHeight + 25, 6, 8);
      ctx.fillStyle = '#120826';
    }

    // 4. Ground / Roadbed
    const groundGradient = ctx.createLinearGradient(0, h * 0.55, 0, h);
    groundGradient.addColorStop(0, '#06030e');
    groundGradient.addColorStop(1, '#150628');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // 5. Asphalt Racing Circuit
    const roadCenterY = h * 0.72;
    const roadHeight = 270;
    ctx.fillStyle = '#12121e';
    ctx.fillRect(0, roadCenterY - roadHeight / 2, w, roadHeight);

    // Neon Track Guard Rails (Top & Bottom)
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, roadCenterY - roadHeight / 2 - 4, w, 6);
    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(0, roadCenterY + roadHeight / 2 - 2, w, 6);
    ctx.shadowBlur = 0;

    // Moving Road Dashes
    const roadDashOffset = (this.distance * 6) % 90;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let x = -90; x < w + 90; x += 90) {
      ctx.fillRect(x - roadDashOffset, roadCenterY - 45, 45, 4);
      ctx.fillRect(x - roadDashOffset, roadCenterY + 45, 45, 4);
    }

    // Render Skidmarks
    for (const sm of this.skidmarks) {
      ctx.fillStyle = `rgba(0, 0, 0, ${sm.alpha * 0.5})`;
      ctx.fillRect(sm.x - 20, sm.y - 3, 30, 6);
    }

    // 6. Speed streak lines (during high speed / nitro)
    if (this.speed > 220) {
      ctx.strokeStyle = this.input.boost ? 'rgba(0, 240, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = this.input.boost ? 3 : 1.5;
      for (const line of this.speedLines) {
        line.x -= line.speed * (this.speed / 100);
        if (line.x < -100) line.x = w + 100;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x - line.length, line.y);
        ctx.stroke();
      }
    }

    // 7. Render Road Pickups
    for (const p of this.pickups) {
      if (p.collected) continue;
      const screenX = (p.x - this.distance) * 2.2 + 200;
      if (screenX > -50 && screenX < w + 50) {
        const screenY = roadCenterY + p.laneY;
        ctx.save();
        ctx.translate(screenX, screenY);

        if (p.type === 'shard') {
          // Glowing NEAR Shard crystal
          ctx.shadowColor = '#00e599';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#00e599';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(11, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(-11, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px Orbitron, sans-serif';
          ctx.fillText('NEAR', -14, -18);
        } else {
          // Nitro Canister
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(-8, -12, 16, 24);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-5, -16, 10, 4);
          ctx.font = 'bold 8px Rajdhani, sans-serif';
          ctx.fillText('NOS', -7, 3);
        }
        ctx.restore();
      }
    }

    // 8. Render Rival Cars
    for (const rival of this.rivals) {
      const screenX = (rival.x - this.distance) * 2.2 + 200;
      if (screenX > -150 && screenX < w + 150) {
        const screenY = roadCenterY + rival.y;
        this.drawCar(screenX, screenY, rival.color, 0, false, rival.type);
      }
    }

    // 9. Render Player Car (Always anchored near x = 200)
    const playerScreenX = 200;
    const playerScreenY = roadCenterY + this.carLaneY;
    this.drawCar(playerScreenX, playerScreenY, '#00e599', this.carAngle, this.input.boost && this.boostFuel > 0, 'NC-PROTOTYPE');

    // 10. Finish Line Arch
    const finishScreenX = (this.trackLength - this.distance) * 2.2 + 200;
    if (finishScreenX > -100 && finishScreenX < w + 100) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      // Checkerboard finish banner
      for (let y = roadCenterY - roadHeight / 2; y < roadCenterY + roadHeight / 2; y += 20) {
        const toggle = Math.floor(y / 20) % 2 === 0;
        ctx.fillStyle = toggle ? '#000' : '#fff';
        ctx.fillRect(finishScreenX, y, 16, 20);
        ctx.fillStyle = toggle ? '#fff' : '#000';
        ctx.fillRect(finishScreenX + 16, y, 16, 20);
      }
      ctx.fillStyle = '#00f0ff';
      ctx.font = '900 22px Orbitron, sans-serif';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fillText('FINISH LINE · 4.5 KM', finishScreenX - 80, roadCenterY - roadHeight / 2 - 20);
      ctx.restore();
    }
  }

  private drawCar(x: number, y: number, primaryColor: string, angle: number, boosting: boolean, label: string) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Neon Underglow
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-45, -18, 90, 36);

    // Main Chassis
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f1118';
    ctx.beginPath();
    ctx.roundRect(-48, -20, 96, 40, 8);
    ctx.fill();

    // Body Paint Panels
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-38, -17, 76, 34, 5);
    ctx.fill();

    // Cockpit / Windshield
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.roundRect(-15, -12, 38, 24, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.fillRect(-10, -10, 16, 20);

    // Wheels (4 spinning slicks)
    ctx.fillStyle = '#05070a';
    ctx.fillRect(-36, -24, 20, 7);
    ctx.fillRect(18, -24, 20, 7);
    ctx.fillRect(-36, 17, 20, 7);
    ctx.fillRect(18, 17, 20, 7);

    // Rims
    ctx.fillStyle = '#a0aec0';
    ctx.fillRect(-30, -23, 8, 5);
    ctx.fillRect(24, -23, 8, 5);
    ctx.fillRect(-30, 18, 8, 5);
    ctx.fillRect(24, 18, 8, 5);

    // Headlights
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(44, -16, 5, 8);
    ctx.fillRect(44, 8, 5, 8);

    // Exhaust Nitrous Flames when boosting
    if (boosting) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(-48, -7);
      ctx.lineTo(-75 - Math.random() * 25, 0);
      ctx.lineTo(-48, 7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-48, -3);
      ctx.lineTo(-62 - Math.random() * 10, 0);
      ctx.lineTo(-48, 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
