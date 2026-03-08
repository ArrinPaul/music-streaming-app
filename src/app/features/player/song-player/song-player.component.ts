import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';
import { AudioService, AudioState } from '../../../core/services/audio.service';
import { UserService } from '../../../core/services/user.service';
import { Song, PlaybackState, RepeatMode } from '../../../core/models';

@Component({
  selector: 'app-song-player',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './song-player.component.html',
  styleUrl: './song-player.component.scss'
})
export class SongPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('visualizerCanvas') visualizerCanvas?: ElementRef<HTMLCanvasElement>;

  audioState: AudioState | null = null;
  currentSong: Song | null = null;
  isFavorite: boolean = false;
  
  // Progress
  progress: number = 0;
  currentTimeFormatted: string = '0:00';
  durationFormatted: string = '0:00';
  
  // Volume
  volume: number = 80;
  isMuted: boolean = false;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private readonly isBrowser: boolean;
  
  private destroy$ = new Subject<void>();

  constructor(
    private audioService: AudioService,
    private userService: UserService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.subscribeToAudioState();
    this.loadUserPreferences();
  }

  ngAfterViewInit(): void {
    this.tryInitializeVisualizer();
  }

  ngOnDestroy(): void {
    this.stopVisualizerLoop();
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToAudioState(): void {
    this.audioService.audioState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.audioState = state;
        this.currentSong = state.currentSong;
        this.volume = state.volume;
        this.isMuted = state.isMuted;
        
        if (state.duration > 0) {
          this.progress = (state.currentTime / state.duration) * 100;
        } else {
          this.progress = 0;
        }
        
        this.currentTimeFormatted = this.formatTime(state.currentTime);
        this.durationFormatted = this.formatTime(state.duration);
        
        if (this.currentSong) {
          this.isFavorite = this.userService.isFavorite(this.currentSong.id);
        }

        if (state.playbackState === PlaybackState.PLAYING) {
          this.tryInitializeVisualizer();
        }
      });
  }

  private tryInitializeVisualizer(): void {
    if (!this.isBrowser || !this.visualizerCanvas) {
      return;
    }

    const audio = this.audioService.getAudioElement();
    if (!audio) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.84;

      this.mediaSource = this.audioContext.createMediaElementSource(audio);
      this.mediaSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    if (this.animationFrameId === null) {
      this.startVisualizerLoop();
    }
  }

  private startVisualizerLoop(): void {
    const canvas = this.visualizerCanvas?.nativeElement;
    const analyser = this.analyser;
    if (!canvas || !analyser) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.clientWidth || 560;
      const height = canvas.clientHeight || 72;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      analyser.getByteFrequencyData(dataArray);

      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(255,255,255,0.05)';
      context.fillRect(0, 0, width, height);

      const barCount = 56;
      const step = Math.max(1, Math.floor(bufferLength / barCount));
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const magnitude = (value / 255) * height;
        const x = i * barWidth;
        const y = height - magnitude;

        const gradient = context.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, '#22c1ff');
        gradient.addColorStop(1, '#5c67ff');
        context.fillStyle = gradient;
        context.fillRect(x + 1, y, Math.max(2, barWidth - 2), magnitude);
      }

      this.animationFrameId = requestAnimationFrame(draw);
    };

    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(draw);
    });
  }

  private stopVisualizerLoop(): void {
    if (this.animationFrameId !== null && this.isBrowser) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loadUserPreferences(): void {
    const preferences = this.userService.getPreferences();
    if (preferences) {
      this.audioService.setVolume(preferences.volume);
      this.audioService.setRepeatMode(preferences.repeatMode as RepeatMode);
      this.audioService.setShuffle(preferences.shuffle);
    }
  }

  togglePlayPause(): void {
    this.audioService.togglePlayPause();
  }

  playNext(): void {
    this.audioService.playNext();
  }

  playPrevious(): void {
    this.audioService.playPrevious();
  }

  onProgressChange(value: number): void {
    if (this.audioState && this.audioState.duration > 0) {
      const newTime = (value / 100) * this.audioState.duration;
      this.audioService.seek(newTime);
    }
  }

  onVolumeChange(value: number): void {
    this.audioService.setVolume(value);
    this.userService.updatePreferences({ volume: value });
  }

  toggleMute(): void {
    this.audioService.toggleMute();
  }

  toggleRepeat(): void {
    this.audioService.toggleRepeatMode();
    const state = this.audioService.getState();
    this.userService.updatePreferences({ repeatMode: state.repeatMode });
  }

  toggleShuffle(): void {
    this.audioService.toggleShuffle();
    const state = this.audioService.getState();
    this.userService.updatePreferences({ shuffle: state.isShuffled });
  }

  toggleFavorite(): void {
    if (this.currentSong) {
      this.userService.toggleFavorite(this.currentSong.id);
      this.isFavorite = this.userService.isFavorite(this.currentSong.id);
    }
  }

  getPlayPauseIcon(): string {
    return this.audioState?.playbackState === PlaybackState.PLAYING ? 'pause' : 'play_arrow';
  }

  getRepeatIcon(): string {
    switch (this.audioState?.repeatMode) {
      case RepeatMode.ONE:
        return 'repeat_one';
      case RepeatMode.ALL:
        return 'repeat';
      default:
        return 'repeat';
    }
  }

  getRepeatColor(): string {
    return this.audioState?.repeatMode !== RepeatMode.OFF ? 'primary' : '';
  }

  getShuffleColor(): string {
    return this.audioState?.isShuffled ? 'primary' : '';
  }

  getVolumeIcon(): string {
    if (this.isMuted || this.volume === 0) {
      return 'volume_off';
    } else if (this.volume < 50) {
      return 'volume_down';
    } else {
      return 'volume_up';
    }
  }

  isPlaying(): boolean {
    return this.audioState?.playbackState === PlaybackState.PLAYING;
  }

  isLoading(): boolean {
    return this.audioState?.playbackState === PlaybackState.LOADING;
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
