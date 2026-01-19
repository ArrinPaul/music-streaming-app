import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { MusicService } from '../../../core/services/music.service';
import { AudioService } from '../../../core/services/audio.service';
import { UserService } from '../../../core/services/user.service';
import { Song, Genre } from '../../../core/models';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './song-list.component.html',
  styleUrl: './song-list.component.scss'
})
export class SongListComponent implements OnInit, OnDestroy {
  songs: Song[] = [];
  filteredSongs: Song[] = [];
  favoriteSongIds: string[] = [];
  currentlyPlayingSongId: string | null = null;
  
  searchQuery: string = '';
  selectedGenre: string = 'all';
  genres: string[] = ['all', ...Object.values(Genre)];
  
  loading: boolean = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private musicService: MusicService,
    private audioService: AudioService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSongs();
    this.loadFavorites();
    this.subscribeToAudioState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all songs
   */
  loadSongs(): void {
    this.loading = true;
    this.musicService.getSongs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (songs) => {
          this.songs = songs;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading songs:', error);
          this.snackBar.open('Error loading songs', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  /**
   * Load user favorites
   */
  loadFavorites(): void {
    this.userService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favoriteSongIds = favorites;
      });
  }

  /**
   * Subscribe to audio state changes
   */
  subscribeToAudioState(): void {
    this.audioService.audioState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentlyPlayingSongId = state.currentSong?.id || null;
      });
  }

  /**
   * Apply search and genre filters
   */
  applyFilters(): void {
    let result = [...this.songs];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artistName.toLowerCase().includes(query) ||
        song.albumName.toLowerCase().includes(query)
      );
    }

    // Apply genre filter
    if (this.selectedGenre !== 'all') {
      result = result.filter(song => song.genre === this.selectedGenre);
    }

    this.filteredSongs = result;
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Handle genre selection change
   */
  onGenreChange(): void {
    this.applyFilters();
  }

  /**
   * Play a song
   */
  playSong(song: Song): void {
    this.audioService.playSong(song, this.filteredSongs);
    this.snackBar.open(`Playing: ${song.title}`, 'Close', { duration: 2000 });
  }

  /**
   * Toggle play/pause for a song
   */
  togglePlayPause(song: Song): void {
    const audioState = this.audioService.getState();
    
    if (audioState.currentSong?.id === song.id) {
      this.audioService.togglePlayPause();
    } else {
      this.playSong(song);
    }
  }

  /**
   * Check if song is currently playing
   */
  isPlaying(song: Song): boolean {
    const audioState = this.audioService.getState();
    return audioState.currentSong?.id === song.id && 
           audioState.playbackState === 'playing';
  }

  /**
   * Check if song is currently paused
   */
  isPaused(song: Song): boolean {
    const audioState = this.audioService.getState();
    return audioState.currentSong?.id === song.id && 
           audioState.playbackState === 'paused';
  }

  /**
   * Check if song is favorite
   */
  isFavorite(song: Song): boolean {
    return this.favoriteSongIds.includes(song.id);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation();
    this.userService.toggleFavorite(song.id);
    
    const isFav = this.userService.isFavorite(song.id);
    const message = isFav ? 'Added to favorites' : 'Removed from favorites';
    this.snackBar.open(message, 'Close', { duration: 2000 });
  }

  /**
   * Add song to playlist
   */
  addToPlaylist(song: Song, event: Event): void {
    event.stopPropagation();
    // This will be implemented when playlist dialog is created
    this.snackBar.open('Playlist feature coming soon!', 'Close', { duration: 2000 });
  }

  /**
   * Format duration to MM:SS
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get play button icon based on state
   */
  getPlayIcon(song: Song): string {
    if (this.isPlaying(song)) {
      return 'pause';
    }
    return 'play_arrow';
  }
}
