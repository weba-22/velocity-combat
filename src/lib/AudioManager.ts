import { Howl } from 'howler';

class AudioManager {
  private music: { [key: string]: Howl } = {};
  private sfx: { [key: string]: Howl } = {};
  private currentMusic: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Initial music tracks (Placeholders - user should provide real paths or URLs)
    // For now using some standard royalty free test URLs if possible or just defining structure.
    this.music = {
      menu: new Howl({
        src: ['https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'],
        loop: true,
        volume: 0.3,
        html5: true
      }),
      race: new Howl({
        src: ['https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3'],
        loop: true,
        volume: 0.4,
        html5: true
      }),
      combat: new Howl({
        src: ['https://assets.mixkit.co/music/preview/mixkit-complex-278.mp3'],
        loop: true,
        volume: 0.5,
        html5: true
      }),
      gameover: new Howl({
        src: ['https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3'],
        loop: false,
        volume: 0.5,
        html5: true
      })
    };

    this.sfx = {
      click: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3'], volume: 0.5 }),
      engine: new Howl({ src: ['/audio/engine.mp3'], loop: true, volume: 0.2 }),
      nitro: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-fire-breathing-dragon-445.mp3'], volume: 0.6 }),
      explosion: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-explosion-with-debris-2182.mp3'], volume: 0.7 }),
      missile: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-rocket-launcher-release-1635.mp3'], volume: 0.5 }),
      shield: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-shield-up-3151.mp3'], volume: 0.5 }),
      mine: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-mechanical-clunk-1033.mp3'], volume: 0.4 })
    };
  }

  startEngine() {
    try {
      if (!this.sfx.engine.playing()) {
        this.sfx.engine.play();
        this.sfx.engine.fade(0, this.isMuted ? 0 : 0.2, 500);
      }
    } catch (e) {
      console.warn("Engine start failed:", e);
    }
  }

  stopEngine() {
    try {
      if (this.sfx.engine.playing()) {
        this.sfx.engine.fade(this.sfx.engine.volume(), 0, 500);
        setTimeout(() => this.sfx.engine.stop(), 500);
      }
    } catch (e) {
      console.warn("Engine stop failed:", e);
    }
  }

  playMusic(key: string) {
    try {
      if (this.currentMusic === key) return;
      
      if (this.currentMusic && this.music[this.currentMusic]) {
        this.music[this.currentMusic].fade(this.music[this.currentMusic].volume(), 0, 1000);
        const prevMusic = this.currentMusic;
        setTimeout(() => {
          if (this.currentMusic !== prevMusic && this.music[prevMusic]) {
             this.music[prevMusic].stop();
          }
        }, 1000);
      }

      this.currentMusic = key;
      if (this.music[key]) {
        this.music[key].volume(this.isMuted ? 0 : this.volume);
        this.music[key].play();
        this.music[key].fade(0, this.volume * 0.6, 1000);
      }
    } catch (e) {
      console.error("Audio Playback Error:", e);
    }
  }

  playSFX(key: string) {
    try {
      if (this.isMuted) return;
      if (this.sfx[key]) {
        this.sfx[key].play();
      }
    } catch (e) {
      console.warn("SFX Playback Error:", e);
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    Object.values(this.music).forEach(m => m.volume(this.isMuted ? 0 : volume * 0.6));
    Object.values(this.sfx).forEach(s => s.volume(this.isMuted ? 0 : volume));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
