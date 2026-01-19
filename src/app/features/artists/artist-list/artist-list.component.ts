import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MusicService } from '../../../core/services/music.service';
import { Artist, Genre } from '../../../core/models';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './artist-list.component.html',
  styleUrl: './artist-list.component.scss'
})
export class ArtistListComponent implements OnInit, OnDestroy {
  artists: Artist[] = [];
  filteredArtists: Artist[] = [];
  searchQuery: string = '';
  selectedGenre: Genre | null = null;
  isLoading: boolean = true;

  genres = Object.values(Genre);

  private destroy$ = new Subject<void>();

  constructor(
    private musicService: MusicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadArtists(): void {
    this.isLoading = true;
    this.musicService.loadArtists();
    
    this.musicService.getArtists()
      .pipe(takeUntil(this.destroy$))
      .subscribe(artists => {
        this.artists = artists;
        this.filterArtists();
        this.isLoading = false;
      });
  }

  filterArtists(): void {
    let filtered = [...this.artists];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(query) ||
        artist.biography?.toLowerCase().includes(query)
      );
    }

    // Apply genre filter
    if (this.selectedGenre) {
      filtered = filtered.filter(artist => 
        artist.genres.includes(this.selectedGenre!)
      );
    }

    this.filteredArtists = filtered;
  }

  onSearchChange(): void {
    this.filterArtists();
  }

  selectGenre(genre: Genre): void {
    this.selectedGenre = this.selectedGenre === genre ? null : genre;
    this.filterArtists();
  }

  isGenreSelected(genre: Genre): boolean {
    return this.selectedGenre === genre;
  }

  viewArtistDetail(artistId: string): void {
    this.router.navigate(['/artists', artistId]);
  }

  formatListeners(listeners: number | undefined): string {
    const count = listeners || 0;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}
