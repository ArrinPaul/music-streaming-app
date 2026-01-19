import { Song } from './song.model';

/**
 * Playlist interface representing a user-created playlist
 */
export interface Playlist {
  readonly id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  songs: Song[];
  createdDate: Date;
  updatedDate: Date;
  isPublic?: boolean;
  ownerId?: string;
}

/**
 * Playlist class implementation with management methods
 */
export class PlaylistModel implements Playlist {
  readonly id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  songs: Song[];
  createdDate: Date;
  updatedDate: Date;
  isPublic: boolean;
  ownerId?: string;

  constructor(data: Playlist) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.coverImageUrl = data.coverImageUrl;
    this.songs = data.songs || [];
    this.createdDate = data.createdDate;
    this.updatedDate = data.updatedDate;
    this.isPublic = data.isPublic || false;
    this.ownerId = data.ownerId;
  }

  /**
   * Get total duration of all songs in playlist
   */
  getTotalDuration(): number {
    return this.songs.reduce((total, song) => total + song.duration, 0);
  }

  /**
   * Get formatted total duration
   */
  getFormattedDuration(): string {
    const totalSeconds = this.getTotalDuration();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Get song count
   */
  getSongCount(): number {
    return this.songs.length;
  }

  /**
   * Add song to playlist
   */
  addSong(song: Song): void {
    if (!this.songs.find(s => s.id === song.id)) {
      this.songs.push(song);
      this.updatedDate = new Date();
    }
  }

  /**
   * Remove song from playlist
   */
  removeSong(songId: string): void {
    this.songs = this.songs.filter(s => s.id !== songId);
    this.updatedDate = new Date();
  }

  /**
   * Check if song is in playlist
   */
  hasSong(songId: string): boolean {
    return this.songs.some(s => s.id === songId);
  }

  /**
   * Reorder songs in playlist
   */
  reorderSongs(fromIndex: number, toIndex: number): void {
    const [removed] = this.songs.splice(fromIndex, 1);
    this.songs.splice(toIndex, 0, removed);
    this.updatedDate = new Date();
  }
}
