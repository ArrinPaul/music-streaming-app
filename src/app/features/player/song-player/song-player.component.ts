import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class SongPlayerComponent implements OnInit, OnDestroy {
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
  
  private destroy$ = new Subject<void>();

  constructor(
    private audioService: AudioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscribeToAudioState();
    this.loadUserPreferences();
  }

  ngOnDestroy(): void {
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
      });
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
