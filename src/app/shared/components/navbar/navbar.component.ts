import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../core/services/user.service';
import { MusicService } from '../../../core/services/music.service';
import { Observable } from 'rxjs';
import { User, Song } from '../../../core/models';
import { Router } from '@angular/router';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentTheme: 'light' | 'dark' = 'dark';
  searchQuery = '';
  allSongs: Song[] = [];
  searchResults: Song[] = [];
  showSearchResults = false;

  constructor(
    private userService: UserService,
    private musicService: MusicService,
    private audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;
    this.currentTheme = this.userService.getTheme();
    this.musicService.getSongs().subscribe(songs => {
      this.allSongs = songs;
    });
  }

  toggleTheme(): void {
    this.userService.toggleTheme();
    this.currentTheme = this.userService.getTheme();
    // Apply theme to document
    document.body.classList.toggle('light-theme', this.currentTheme === 'light');
    document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.searchResults = this.allSongs
      .filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artistName.toLowerCase().includes(query) ||
        song.albumName.toLowerCase().includes(query)
      )
      .slice(0, 6);
    this.showSearchResults = this.searchResults.length > 0;
  }

  onSearchFocus(): void {
    this.showSearchResults = this.searchResults.length > 0;
  }

  closeSearchResults(): void {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 150);
  }

  selectSong(song: Song): void {
    this.audioService.playSong(song, this.allSongs);
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.router.navigate(['/now-playing']);
  }

  goToSearchPage(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      return;
    }
    this.showSearchResults = false;
    this.router.navigate(['/songs'], { queryParams: { q: query } });
  }
}
