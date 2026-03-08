import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MusicService } from '../../core/services/music.service';
import { AudioService } from '../../core/services/audio.service';
import { AiRecommendationService, MusicMood } from '../../core/services/ai-recommendation.service';
import { Song, Artist, Album } from '../../core/models';
import { DurationFormatPipe } from '../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    DurationFormatPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  songs: Song[] = [];
  artists: Artist[] = [];
  albums: Album[] = [];
  recentSongs: Song[] = [];
  recommendedSongs: Song[] = [];
  recentlyPlayed: Song[] = [];
  selectedMood: MusicMood | null = null;
  moodSongs: Song[] = [];
  loading = true;

  songColumns: string[] = ['title', 'artist', 'album', 'duration', 'actions'];
  artistColumns: string[] = ['name', 'genre', 'actions'];

  // Mood options with icons
  moods: Array<{ value: MusicMood; label: string; icon: string; color: string }> = [
    { value: MusicMood.ENERGETIC, label: 'Energetic', icon: 'bolt', color: 'warn' },
    { value: MusicMood.CHILL, label: 'Chill', icon: 'spa', color: 'primary' },
    { value: MusicMood.FOCUS, label: 'Focus', icon: 'visibility', color: 'accent' },
    { value: MusicMood.HAPPY, label: 'Happy', icon: 'sentiment_very_satisfied', color: 'warn' },
    { value: MusicMood.SAD, label: 'Sad', icon: 'sentiment_dissatisfied', color: 'primary' },
    { value: MusicMood.WORKOUT, label: 'Workout', icon: 'fitness_center', color: 'accent' },
    { value: MusicMood.PARTY, label: 'Party', icon: 'celebration', color: 'warn' },
    { value: MusicMood.ROMANTIC, label: 'Romantic', icon: 'favorite', color: 'accent' }
  ];

  constructor(
    private musicService: MusicService,
    private audioService: AudioService,
    private aiService: AiRecommendationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.musicService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.recentSongs = songs.slice(0, 8);
       
        // Get AI recommendations
        this.recommendedSongs = this.aiService.getRecommendations(8);
        
        // Get recently played
        this.recentlyPlayed = this.aiService.getRecentlyPlayed(6);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading songs:', error);
        this.loading = false;
      }
    });

    this.musicService.getArtists().subscribe({
      next: (artists) => {
        this.artists = artists;
      },
      error: (error) => console.error('Error loading artists:', error)
    });

    this.musicService.getAlbums().subscribe({
      next: (albums) => {
        this.albums = albums;
      },
      error: (error) => console.error('Error loading albums:', error)
    });
  }

  playSong(song: Song): void {
    this.audioService.playSong(song);
  }

  selectMood(mood: MusicMood): void {
    this.selectedMood = mood === this.selectedMood ? null : mood;
    if (this.selectedMood) {
      this.moodSongs = this.aiService.getSongsByMood(this.selectedMood, 8);
    } else {
      this.moodSongs = [];
    }
  }

  viewArtist(artist: Artist): void {
    console.log('Viewing artist:', artist.name);
    // Navigate to artist details
  }

  viewAlbum(album: Album): void {
    console.log('Viewing album:', album.title);
    // Navigate to album details
  }
}
