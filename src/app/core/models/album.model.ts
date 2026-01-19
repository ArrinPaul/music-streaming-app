import { Genre } from './enums';

/**
 * Album interface representing a music album
 */
export interface Album {
  readonly id: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: Date;
  genre: Genre;
  coverImageUrl?: string;
  trackCount: number;
  totalDuration?: number; // in seconds
  description?: string;
  recordLabel?: string;
}

/**
 * Album class implementation
 */
export class AlbumModel implements Album {
  readonly id: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: Date;
  genre: Genre;
  coverImageUrl?: string;
  trackCount: number;
  totalDuration?: number;
  description?: string;
  recordLabel?: string;

  constructor(data: Album) {
    this.id = data.id;
    this.title = data.title;
    this.artistId = data.artistId;
    this.artistName = data.artistName;
    this.releaseDate = data.releaseDate;
    this.genre = data.genre;
    this.coverImageUrl = data.coverImageUrl;
    this.trackCount = data.trackCount;
    this.totalDuration = data.totalDuration;
    this.description = data.description;
    this.recordLabel = data.recordLabel;
  }

  /**
   * Get formatted release year
   */
  getReleaseYear(): number {
    return this.releaseDate.getFullYear();
  }

  /**
   * Get formatted total duration
   */
  getFormattedDuration(): string {
    if (!this.totalDuration) return 'N/A';
    
    const hours = Math.floor(this.totalDuration / 3600);
    const minutes = Math.floor((this.totalDuration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
