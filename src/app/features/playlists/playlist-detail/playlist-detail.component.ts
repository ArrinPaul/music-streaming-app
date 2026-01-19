import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MusicService } from '../../../core/services/music.service';
import { AudioService } from '../../../core/services/audio.service';
import { UserService } from '../../../core/services/user.service';
import { Playlist, Song, PlaybackState } from '../../../core/models';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss'
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  playlist: Playlist | null = null;
  isLoading: boolean = true;
  currentSongId: string | null = null;
  isPlaying: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicService: MusicService,
    private audioService: AudioService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const playlistId = params.get('id');
        if (playlistId) {
          this.loadPlaylist(playlistId);
        }
      });

    this.audioService.audioState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentSongId = state.currentSong?.id || null;
        this.isPlaying = state.playbackState === PlaybackState.PLAYING;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlaylist(playlistId: string): void {
    this.isLoading = true;

    this.musicService.getPlaylistById(playlistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(playlist => {
        if (playlist) {
          this.playlist = playlist;
        } else {
          this.snackBar.open('Playlist not found', 'Close', { duration: 3000 });
          this.router.navigate(['/playlists']);
        }
        this.isLoading = false;
      });
  }

  playSong(song: Song): void {
    if (!this.playlist) return;

    if (this.currentSongId === song.id && this.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.playSong(song, this.playlist.songs);
    }
  }

  playAll(): void {
    if (this.playlist && this.playlist.songs.length > 0) {
      this.audioService.playSong(this.playlist.songs[0], this.playlist.songs);
      this.snackBar.open('Playing all songs', 'Close', { duration: 2000 });
    }
  }

  shufflePlay(): void {
    if (this.playlist && this.playlist.songs.length > 0) {
      const shuffled = [...this.playlist.songs].sort(() => Math.random() - 0.5);
      this.audioService.playSong(shuffled[0], shuffled);
      this.audioService.toggleShuffle();
      this.snackBar.open('Shuffle play started', 'Close', { duration: 2000 });
    }
  }

  removeSong(song: Song): void {
    if (!this.playlist) return;

    if (confirm(`Remove "${song.title}" from this playlist?`)) {
      this.musicService.removeSongFromPlaylist(this.playlist.id, song.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Song removed from playlist', 'Close', { duration: 2000 });
            this.loadPlaylist(this.playlist!.id);
          },
          error: () => {
            this.snackBar.open('Failed to remove song', 'Close', { duration: 2000 });
          }
        });
    }
  }

  toggleFavorite(song: Song): void {
    this.userService.toggleFavorite(song.id);
    const isFavorite = this.userService.isFavorite(song.id);
    this.snackBar.open(
      isFavorite ? 'Added to favorites' : 'Removed from favorites',
      'Close',
      { duration: 2000 }
    );
  }

  isFavorite(songId: string): boolean {
    return this.userService.isFavorite(songId);
  }

  isCurrentSong(songId: string): boolean {
    return this.currentSongId === songId;
  }

  isCurrentSongPlaying(songId: string): boolean {
    return this.isCurrentSong(songId) && this.isPlaying;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getTotalDuration(): number {
    if (!this.playlist) return 0;
    return this.playlist.songs.reduce((total, song) => total + song.duration, 0);
  }

  formatTotalDuration(): string {
    const totalSeconds = this.getTotalDuration();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  }

  goBack(): void {
    this.router.navigate(['/playlists']);
  }
}
