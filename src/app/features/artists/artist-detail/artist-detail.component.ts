import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MusicService } from '../../../core/services/music.service';
import { AudioService } from '../../../core/services/audio.service';
import { UserService } from '../../../core/services/user.service';
import { Artist, Song, Album, PlaybackState } from '../../../core/models';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './artist-detail.component.html',
  styleUrl: './artist-detail.component.scss'
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  artist: Artist | null = null;
  topSongs: Song[] = [];
  albums: Album[] = [];
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
        const artistId = params.get('id');
        if (artistId) {
          this.loadArtistDetails(artistId);
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

  private loadArtistDetails(artistId: string): void {
    this.isLoading = true;

    // Load artist
    this.musicService.getArtistById(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(artist => {
        if (artist) {
          this.artist = artist;
          this.loadArtistSongs(artistId);
          this.loadArtistAlbums(artistId);
        } else {
          this.snackBar.open('Artist not found', 'Close', { duration: 3000 });
          this.router.navigate(['/artists']);
        }
        this.isLoading = false;
      });
  }

  private loadArtistSongs(artistId: string): void {
    this.musicService.getSongsByArtist(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(songs => {
        // Get top 10 songs sorted by play count
        this.topSongs = songs
          .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
          .slice(0, 10);
      });
  }

  private loadArtistAlbums(artistId: string): void {
    this.musicService.getAlbumsByArtist(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(albums => {
        this.albums = albums.sort((a, b) => 
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      });
  }

  playSong(song: Song): void {
    if (this.currentSongId === song.id && this.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.playSong(song, this.topSongs);
    }
  }

  playAll(): void {
    if (this.topSongs.length > 0) {
      this.audioService.playSong(this.topSongs[0], this.topSongs);
      this.snackBar.open('Playing all songs', 'Close', { duration: 2000 });
    }
  }

  shufflePlay(): void {
    if (this.topSongs.length > 0) {
      const shuffled = [...this.topSongs].sort(() => Math.random() - 0.5);
      this.audioService.playSong(shuffled[0], shuffled);
      this.snackBar.open('Shuffle play started', 'Close', { duration: 2000 });
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

  formatListeners(listeners: number): string {
    if (listeners >= 1000000) {
      return `${(listeners / 1000000).toFixed(1)}M`;
    } else if (listeners >= 1000) {
      return `${(listeners / 1000).toFixed(1)}K`;
    }
    return listeners.toString();
  }

  openSocialLink(url: string): void {
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/artists']);
  }

  viewAlbum(albumId: string): void {
    // Navigate to album detail (if implemented)
    this.snackBar.open('Album detail page coming soon!', 'Close', { duration: 2000 });
  }
}
