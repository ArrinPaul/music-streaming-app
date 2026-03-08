import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Song, PlaybackState, RepeatMode } from '../models';
import { AiRecommendationService } from './ai-recommendation.service';

/**
 * Audio playback state interface
 */
export interface AudioState {
  currentSong: Song | null;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  
  private audioStateSubject = new BehaviorSubject<AudioState>({
    currentSong: null,
    playbackState: PlaybackState.STOPPED,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    repeatMode: RepeatMode.OFF,
    isShuffled: false
  });

  private playlist: Song[] = [];
  private currentIndex: number = -1;

  public audioState$ = this.audioStateSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aiService: AiRecommendationService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio();
      this.initializeAudioListeners();
    }
  }

  /**
   * Initialize audio element event listeners
   */
  private initializeAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateState({ duration: this.audio!.duration });
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: this.audio!.currentTime });
    });

    this.audio.addEventListener('ended', () => {
      this.handleSongEnded();
    });

    this.audio.addEventListener('play', () => {
      this.updateState({ playbackState: PlaybackState.PLAYING });
    });

    this.audio.addEventListener('pause', () => {
      if (this.audio!.currentTime === 0 || this.audio!.ended) {
        this.updateState({ playbackState: PlaybackState.STOPPED });
      } else {
        this.updateState({ playbackState: PlaybackState.PAUSED });
      }
    });

    this.audio.addEventListener('error', () => {
      this.updateState({ playbackState: PlaybackState.ERROR });
      console.error('Error playing audio');
    });

    this.audio.addEventListener('loadstart', () => {
      this.updateState({ playbackState: PlaybackState.LOADING });
    });
  }

  /**
   * Update audio state
   */
  private updateState(updates: Partial<AudioState>): void {
    const currentState = this.audioStateSubject.value;
    this.audioStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Get current audio state
   */
  getState(): AudioState {
    return this.audioStateSubject.value;
  }

  /**
   * Expose audio element for advanced visual features (e.g., visualizer)
   */
  getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }

  /**
   * Load and play a song
   */
  playSong(song: Song, playlist?: Song[]): void {
    if (playlist) {
      this.playlist = playlist;
      this.currentIndex = playlist.findIndex(s => s.id === song.id);
    } else {
      this.playlist = [song];
      this.currentIndex = 0;
    }

    this.loadSong(song);
    this.play();
    
    // Track play with AI recommendation service
    this.aiService.trackSongPlay(song);
  }

  /**
   * Load a song into the audio element
   */
  private loadSong(song: Song): void {
    if (!this.audio) return;
    
    this.audio.src = song.audioUrl;
    this.audio.load();
    this.updateState({ 
      currentSong: song,
      currentTime: 0,
      duration: 0
    });
  }

  /**
   * Play audio
   */
  play(): void {
    if (!this.audio || !this.audio.src) return;
    
    this.audio.play().catch(error => {
      console.error('Error playing audio:', error);
      this.updateState({ playbackState: PlaybackState.ERROR });
    });
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (!this.audio) return;
    
    const state = this.getState();
    if (state.playbackState === PlaybackState.PLAYING) {
      this.pause();
    } else if (state.playbackState === PlaybackState.PAUSED || state.playbackState === PlaybackState.STOPPED) {
      this.play();
    }
  }

  /**
   * Stop audio
   */
  stop(): void {
    if (!this.audio) return;
    
    this.audio.pause();
    this.audio.currentTime = 0;
    this.updateState({ 
      playbackState: PlaybackState.STOPPED,
      currentTime: 0
    });
  }

  /**
   * Seek to specific time
   */
  seek(time: number): void {
    if (!this.audio || !this.audio.duration) return;
    
    if (time >= 0 && time <= this.audio.duration) {
      this.audio.currentTime = time;
      this.updateState({ currentTime: time });
    }
  }

  /**
   * Set volume (0-100)
   */
  setVolume(volume: number): void {
    if (!this.audio) return;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    this.audio.volume = clampedVolume / 100;
    this.updateState({ 
      volume: clampedVolume,
      isMuted: clampedVolume === 0
    });
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    if (!this.audio) return;
    
    const state = this.getState();
    this.audio.muted = !state.isMuted;
    this.updateState({ isMuted: !state.isMuted });
  }

  /**
   * Play next song
   */
  playNext(): void {
    if (this.playlist.length === 0) return;

    const state = this.getState();
    
    if (state.isShuffled) {
      this.playRandom();
      return;
    }

    this.currentIndex++;
    
    if (this.currentIndex >= this.playlist.length) {
      if (state.repeatMode === RepeatMode.ALL) {
        this.currentIndex = 0;
      } else {
        this.stop();
        return;
      }
    }

    const nextSong = this.playlist[this.currentIndex];
    this.loadSong(nextSong);
    this.play();
  }

  /**
   * Play previous song
   */
  playPrevious(): void {
    if (this.playlist.length === 0 || !this.audio) return;

    // If more than 3 seconds into song, restart current song
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }

    this.currentIndex--;
    
    if (this.currentIndex < 0) {
      const state = this.getState();
      if (state.repeatMode === RepeatMode.ALL) {
        this.currentIndex = this.playlist.length - 1;
      } else {
        this.currentIndex = 0;
        this.seek(0);
        return;
      }
    }

    const previousSong = this.playlist[this.currentIndex];
    this.loadSong(previousSong);
    this.play();
  }

  /**
   * Play random song from playlist
   */
  private playRandom(): void {
    if (this.playlist.length === 0) return;
    
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.playlist.length);
    } while (randomIndex === this.currentIndex && this.playlist.length > 1);

    this.currentIndex = randomIndex;
    const randomSong = this.playlist[this.currentIndex];
    this.loadSong(randomSong);
    this.play();
  }

  /**
   * Handle song ended event
   */
  private handleSongEnded(): void {
    const state = this.getState();

    if (state.repeatMode === RepeatMode.ONE) {
      this.seek(0);
      this.play();
    } else {
      this.playNext();
    }
  }

  /**
   * Set repeat mode
   */
  setRepeatMode(mode: RepeatMode): void {
    this.updateState({ repeatMode: mode });
  }

  /**
   * Cycle through repeat modes
   */
  toggleRepeatMode(): void {
    const state = this.getState();
    let newMode: RepeatMode;

    switch (state.repeatMode) {
      case RepeatMode.OFF:
        newMode = RepeatMode.ALL;
        break;
      case RepeatMode.ALL:
        newMode = RepeatMode.ONE;
        break;
      case RepeatMode.ONE:
        newMode = RepeatMode.OFF;
        break;
      default:
        newMode = RepeatMode.OFF;
    }

    this.setRepeatMode(newMode);
  }

  /**
   * Toggle shuffle
   */
  toggleShuffle(): void {
    const state = this.getState();
    this.updateState({ isShuffled: !state.isShuffled });
  }

  /**
   * Set shuffle state
   */
  setShuffle(shuffled: boolean): void {
    this.updateState({ isShuffled: shuffled });
  }

  /**
   * Get current playlist
   */
  getPlaylist(): Song[] {
    return this.playlist;
  }

  /**
   * Get current song index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
