// Synthesized Web Audio chime utility - Zero external audio dependencies needed!
class SoundManager {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // Soothing double chime for Pomodoro complete
  playTimerComplete() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [587.33, 880, 1174.66] // D5, A5, D6 arpeggio

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.18)

      gain.gain.setValueAtTime(0, now + i * 0.18)
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.18 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.18)
      osc.stop(now + i * 0.18 + 1.25)
    })
  }

  // Cheerful chime on task completion
  playTaskComplete() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C-E-G-C triumph

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.09)

      gain.gain.setValueAtTime(0, now + i * 0.09)
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.09 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + 0.55)
    })
  }

  // Subtle click sound for UI toggles
  playClick() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  }
}

export const soundManager = new SoundManager()
