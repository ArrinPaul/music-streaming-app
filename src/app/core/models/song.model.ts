import { Genre } from './enums';

/**
 * Song interface representing a music track
 */
export interface Song {
  readonly id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  genre: Genre;
  duration: number; // in seconds
  audioUrl: string;
  coverImageUrl?: string;
  releaseDate: Date;
  trackNumber?: number;
  playCount?: number;
  isFavorite?: boolean;
}

/**
 * Song class implementation with additional methods
 */
export class SongModel implements Song {
  readonly id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  genre: Genre;
  duration: number;
  audioUrl: string;
  coverImageUrl?: string;
  releaseDate: Date;
  trackNumber?: number;
  playCount: number;
  isFavorite: boolean;

  constructor(data: Song) {
    this.id = data.id;
    this.title = data.title;
    this.artistId = data.artistId;
    this.artistName = data.artistName;
    this.albumId = data.albumId;
    this.albumName = data.albumName;
    this.genre = data.genre;
    this.duration = data.duration;
    this.audioUrl = data.audioUrl;
    this.coverImageUrl = data.coverImageUrl;
    this.releaseDate = data.releaseDate;
    this.trackNumber = data.trackNumber;
    this.playCount = data.playCount || 0;
    this.isFavorite = data.isFavorite || false;
  }

  /**
   * Format duration to MM:SS
   */
  getFormattedDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Increment play count
   */
  incrementPlayCount(): void {
    this.playCount++;
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }
}
