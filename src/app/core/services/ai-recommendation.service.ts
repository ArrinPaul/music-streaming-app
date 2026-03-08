import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Song, Genre } from '../models';
import { MusicService } from './music.service';
import { UserService } from './user.service';

/**
 * AI-Powered recommendation interface
 */
export interface RecommendationScore {
  song: Song;
  score: number;
  reasons: string[];
}

/**
 * Listening statistics interface
 */
export interface ListeningStats {
  totalListeningTime: number;
  totalSongsPlayed: number;
  favoriteGenre: Genre | string;
  topArtists: { name: string; playCount: number }[];
  recentlyPlayed: Song[];
  mostPlayedSongs: Song[];
}

/**
 * Mood-based music recommendation
 */
export enum MusicMood {
  ENERGETIC = 'Energetic',
  CHILL = 'Chill',
  FOCUS = 'Focus',
  HAPPY = 'Happy',
  SAD = 'Sad',
  WORKOUT = 'Workout',
  PARTY = 'Party',
  ROMANTIC = 'Romantic'
}

@Injectable({
  providedIn: 'root'
})
export class AiRecommendationService {
  private recentlyPlayed: Song[] = [];
  private listeningHistory: Map<string, number> = new Map(); // songId -> play count
  private readonly MAX_RECENT = 20;

  // Mood to genre mapping
  private moodGenreMap: Record<MusicMood, string[]> = {
    [MusicMood.ENERGETIC]: ['Rock', 'Hip Hop', 'Electronic', 'Alternative'],
    [MusicMood.CHILL]: ['Jazz', 'Indie', 'R&B'],
    [MusicMood.FOCUS]: ['Classical', 'Jazz', 'Indie'],
    [MusicMood.HAPPY]: ['Pop', 'R&B', 'Electronic'],
    [MusicMood.SAD]: ['Indie', 'Pop', 'Alternative'],
    [MusicMood.WORKOUT]: ['Hip Hop', 'Electronic', 'Rock'],
    [MusicMood.PARTY]: ['Pop', 'Electronic', 'Hip Hop'],
    [MusicMood.ROMANTIC]: ['R&B', 'Pop', 'Jazz']
  };

  constructor(
    private musicService: MusicService,
    private userService: UserService
  ) {
    this.loadListeningHistory();
  }

  /**
   * Load listening history from localStorage
   */
  private loadListeningHistory(): void {
    try {
      const historyJson = localStorage.getItem('music_listening_history');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        this.listeningHistory = new Map(Object.entries(history));
      }

      const recentJson = localStorage.getItem('music_recently_played');
      if (recentJson) {
        this.recentlyPlayed = JSON.parse(recentJson);
      }
    } catch (error) {
      console.error('Error loading listening history:', error);
    }
  }

  /**
   * Save listening history to localStorage
   */
  private saveListeningHistory(): void {
    try {
      const historyObj = Object.fromEntries(this.listeningHistory);
      localStorage.setItem('music_listening_history', JSON.stringify(historyObj));
      localStorage.setItem('music_recently_played', JSON.stringify(this.recentlyPlayed));
    } catch (error) {
      console.error('Error saving listening history:', error);
    }
  }

  /**
   * Track when a song is played
   */
  trackSongPlay(song: Song): void {
    // Update play count
    const currentCount = this.listeningHistory.get(song.id) || 0;
    this.listeningHistory.set(song.id, currentCount + 1);

    // Add to recently played (remove if already exists)
    this.recentlyPlayed = this.recentlyPlayed.filter(s => s.id !== song.id);
    this.recentlyPlayed.unshift(song);

    // Keep only MAX_RECENT songs
    if (this.recentlyPlayed.length > this.MAX_RECENT) {
      this.recentlyPlayed = this.recentlyPlayed.slice(0, this.MAX_RECENT);
    }

    this.saveListeningHistory();
  }

  /**
   * Get AI-powered song recommendations based on listening history
   */
  getRecommendations(limit: number = 10): Observable<RecommendationScore[]> {
    return this.musicService.getSongs().pipe(
      map(songs => {
        const recommendations: RecommendationScore[] = [];
        const favorites = this.userService.getFavorites();
        
        songs.forEach(song => {
          const score = this.calculateRecommendationScore(song, songs, favorites);
          if (score.score > 0) {
            recommendations.push(score);
          }
        });

        // Sort by score descending
        recommendations.sort((a, b) => b.score - a.score);
        
        return recommendations.slice(0, limit);
      })
    );
  }

  /**
   * Calculate recommendation score for a song using AI-like algorithms
   */
  private calculateRecommendationScore(
    song: Song,
    allSongs: Song[],
    favorites: string[]
  ): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score for popularity
    if (song.playCount && song.playCount > 1000000000) {
      score += 10;
      reasons.push('Popular song');
    }

    // Boost if from favorite artist
    const favoriteSongs = allSongs.filter(s => favorites.includes(s.id));
    const favoriteArtists = new Set(favoriteSongs.map(s => s.artistId));
    if (favoriteArtists.has(song.artistId)) {
      score += 30;
      reasons.push

(`From an artist you love`);
    }

    // Boost if same genre as favorites
    const favoriteGenres = favoriteSongs.map(s => s.genre);
    if (favoriteGenres.includes(song.genre)) {
      score += 20;
      reasons.push(`Matches your taste: ${song.genre}`);
    }

    // Boost if in listening history
    const playCount = this.listeningHistory.get(song.id) || 0;
    if (playCount > 0) {
      score += Math.min(playCount * 5, 25);
      reasons.push(`You've played this ${playCount} time${playCount > 1 ? 's' : ''}`);
    }

    // Boost if similar to recently played
    if (this.recentlyPlayed.length > 0) {
      const recentGenres = new Set(this.recentlyPlayed.slice(0, 5).map(s => s.genre));
      if (recentGenres.has(song.genre)) {
        score += 15;
        reasons.push('Similar to what you\'ve been listening to');
      }
    }

    // Boost if already favorited
    if (favorites.includes(song.id)) {
      score += 25;
      reasons.push('One of your favorites');
    }

    // Random discovery bonus for new songs
    if (!this.listeningHistory.has(song.id) && Math.random() > 0.95) {
      score += 15;
      reasons.push('Discover something new');
    }

    // Boost newer songs slightly
    const releaseYear = new Date(song.releaseDate).getFullYear();
    if (releaseYear >= 2015) {
      score += 5;
    }

    return { song, score, reasons };
  }

  /**
   * Get songs by mood
   */
  getSongsByMood(mood: MusicMood): Observable<Song[]> {
    const genres = this.moodGenreMap[mood];
    
    return this.musicService.getSongs().pipe(
      map(songs => {
        return songs
          .filter(song => genres.includes(song.genre))
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 20);
      })
    );
  }

  /**
   * Get listening statistics
   */
  getListeningStats(): Observable<ListeningStats> {
    return this.musicService.getSongs().pipe(
      map(songs => {
        // Calculate total listening time
        const totalListeningTime = Array.from(this.listeningHistory.entries())
          .reduce((total, [songId, count]) => {
            const song = songs.find(s => s.id === songId);
            return total + (song ? song.duration * count : 0);
          }, 0);

        // Total songs played
        const totalSongsPlayed = Array.from(this.listeningHistory.values())
          .reduce((a, b) => a + b, 0);

        // Favorite genre
        const genreCounts: Record<string, number> = {};
        songs.forEach(song => {
          const playCount = this.listeningHistory.get(song.id) || 0;
          if (playCount > 0) {
            genreCounts[song.genre] = (genreCounts[song.genre] || 0) + playCount;
          }
        });
        const favoriteGenre = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Pop';

        // Top artists
        const artistCounts: Record<string, number> = {};
        songs.forEach(song => {
          const playCount = this.listeningHistory.get(song.id) || 0;
          if (playCount > 0) {
            artistCounts[song.artistName] = (artistCounts[song.artistName] || 0) + playCount;
          }
        });
        const topArtists = Object.entries(artistCounts)
          .map(([name, playCount]) => ({ name, playCount }))
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 5);

        // Most played songs
        const mostPlayedSongs = Array.from(this.listeningHistory.entries())
          .map(([songId, count]) => ({
            song: songs.find(s => s.id === songId)!,
            count
          }))
          .filter(item => item.song)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(item => item.song);

        return {
          totalListeningTime,
          totalSongsPlayed,
          favoriteGenre,
          topArtists,
          recentlyPlayed: [...this.recentlyPlayed],
          mostPlayedSongs
        };
      })
    );
  }

  /**
   * Get recently played songs
   */
  getRecentlyPlayed(): Song[] {
    return [...this.recentlyPlayed];
  }

  /**
   * Clear listening history
   */
  clearHistory(): void {
    this.recentlyPlayed = [];
    this.listeningHistory.clear();
    this.saveListeningHistory();
  }

  /**
   * Get similar songs based on a given song
   */
  getSimilarSongs(song: Song, limit: number = 5): Observable<Song[]> {
    return this.musicService.getSongs().pipe(
      map(songs => {
        return songs
          .filter(s => s.id !== song.id) // Exclude the current song
          .map(s => ({
            song: s,
            similarity: this.calculateSimilarity(song, s)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map(item => item.song);
      })
    );
  }

  /**
   * Calculate similarity score between two songs
   */
  private calculateSimilarity(song1: Song, song2: Song): number {
    let score = 0;

    // Same genre (+40 points)
    if (song1.genre === song2.genre) {
      score += 40;
    }

    // Same artist (+50 points)
    if (song1.artistId === song2.artistId) {
      score += 50;
    }

    // Similar duration (+10 points if within 30 seconds)
    if (Math.abs(song1.duration - song2.duration) < 30) {
      score += 10;
    }

    return score;
  }

  /**
   * Get all available moods
   */
  getAllMoods(): MusicMood[] {
    return Object.values(MusicMood);
  }

  /**
   * Get mood icon (for UI display)
   */
  getMoodIcon(mood: MusicMood): string {
    const iconMap: Record<MusicMood, string> = {
      [MusicMood.ENERGETIC]: 'bolt',
      [MusicMood.CHILL]: 'self_improvement',
      [MusicMood.FOCUS]: 'psychology',
      [MusicMood.HAPPY]: 'sentiment_satisfied',
      [MusicMood.SAD]: 'sentiment_dissatisfied',
      [MusicMood.WORKOUT]: 'fitness_center',
      [MusicMood.PARTY]: 'celebration',
      [MusicMood.ROMANTIC]: 'favorite'
    };
    return iconMap[mood];
  }
}
