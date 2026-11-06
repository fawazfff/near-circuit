/**
 * NEAR CIRCUIT - RETRO WEB AUDIO SYNTHESIZER
 * Zero-dependency procedural synth sound effects using the native Web Audio API.
 * Produces dynamic engine revs, turbo spool, tire screech, and victory chimes.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startEngine() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.engineOsc) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      // Lowpass filter for deep engine roar
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public updateEnginePitch(speed: number, maxSpeed: number, isBoosting: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    const speedRatio = Math.min(1, Math.max(0, speed / maxSpeed));
    const targetFreq = 50 + speedRatio * 180 + (isBoosting ? 90 : 0);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);

    const targetVol = 0.03 + speedRatio * 0.04 + (isBoosting ? 0.04 : 0);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Ignored
      }
      this.engineOsc = null;
    }
  }

  public playBoostSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playShardCollect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [587.33, 880, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.06);
      osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.22);
    });
  }

  public playVictoryFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start();
      osc.stop(this.ctx!.currentTime + 1.25);
    });
  }
}

export const sound = new SoundSystem();
