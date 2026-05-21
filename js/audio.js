// ============================================================
// audio — minimal Web Audio synth (no external files)
// Adds tactile feedback without bloating the project.
// ============================================================

class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.master = null;
  }

  enable() {
    if (this.enabled) return;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
      this.enabled = true;
    } catch (_) {
      // ignore — audio is optional
    }
  }

  _tone({ freq = 440, dur = 0.12, type = "sine", gain = 1, attack = 0.005, release = 0.08 }) {
    if (!this.enabled) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.linearRampToValueAtTime(0, t0 + dur + release);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + release + 0.02);
  }

  tick() { this._tone({ freq: 1800, dur: 0.02, type: "square", gain: 0.05, release: 0.02 }); }
  step() { this._tone({ freq: 540, dur: 0.06, type: "triangle", gain: 0.18 }); }
  hover() { this._tone({ freq: 880, dur: 0.04, type: "sine", gain: 0.08 }); }
  click() { this._tone({ freq: 320, dur: 0.05, type: "square", gain: 0.16 }); }
  error() {
    this._tone({ freq: 220, dur: 0.16, type: "sawtooth", gain: 0.22 });
    setTimeout(() => this._tone({ freq: 140, dur: 0.18, type: "sawtooth", gain: 0.22 }), 80);
  }
  success() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) =>
      setTimeout(
        () => this._tone({ freq: f, dur: 0.22, type: "triangle", gain: 0.22, release: 0.2 }),
        i * 90
      )
    );
  }
}

export const audio = new Audio();
