import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MusicService } from '../../core/services/music.service';
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
  loading = true;

  songColumns: string[] = ['title', 'artist', 'album', 'duration', 'actions'];
  artistColumns: string[] = ['name', 'genre', 'actions'];

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.musicService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.recentSongs = songs.slice(0, 5);
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
    console.log('Playing song:', song.title);
    // Music player logic would be implemented here
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
