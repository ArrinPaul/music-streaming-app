import { Injectable } from '@angular/core';
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
  private listeningHistory: Map<string, number> = new Map(); // songId -> playCount
  private allSongs: Song[] = [];
  private readonly MAX_RECENT = 20;

  // Mood to genre mapping
  private moodGenreMap: Record<MusicMood, Genre[]> = {
    [MusicMood.ENERGETIC]: [Genre.ROCK, Genre.HIPHOP, Genre.ELECTRONIC, Genre.ALTERNATIVE],
    [MusicMood.CHILL]: [Genre.JAZZ, Genre.INDIE, Genre.RNB],
    [MusicMood.FOCUS]: [Genre.CLASSICAL, Genre.JAZZ, Genre.INDIE],
    [MusicMood.HAPPY]: [Genre.POP, Genre.RNB, Genre.ELECTRONIC],
    [MusicMood.SAD]: [Genre.INDIE, Genre.POP, Genre.ALTERNATIVE],
    [MusicMood.WORKOUT]: [Genre.HIPHOP, Genre.ELECTRONIC, Genre.ROCK],
    [MusicMood.PARTY]: [Genre.POP, Genre.ELECTRONIC, Genre.HIPHOP],
    [MusicMood.ROMANTIC]: [Genre.RNB, Genre.POP, Genre.JAZZ]
  };

  constructor(
    private musicService: MusicService,
    private userService: UserService
  ) {
    this.loadListeningHistory();
    this.loadSongs();
  }

  /**
   * Load all songs into memory
   */
  private loadSongs(): void {
    this.musicService.getSongs().subscribe(songs => {
      this.allSongs = songs;
    });
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
   * Get AI-powered song recommendations
   */
  getRecommendations(limit: number = 10): Song[] {
    if (this.allSongs.length === 0) {
      return [];
    }

    const favoriteIds = this.userService.getFavorites();
    const favoriteSongs = this.allSongs.filter(s => favoriteIds.includes(s.id));
    
    // Calculate scores for each song
    const scoredSongs = this.allSongs.map(song => {
      const score = this.calculateRecommendationScore(song, favoriteSongs, favoriteIds);
      return { song, ...score };
    });

    // Sort by score and return top results
    return scoredSongs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(scored => scored.song);
  }

  /**
   * Calculate recommendation score for a song
   */
  private calculateRecommendationScore(
    song: Song,
    favoriteSongs: Song[],
    favoriteIds: string[]
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Base score for popularity
    if (song.playCount && song.playCount > 0) {
      score += Math.min(song.playCount, 100) / 10;
      reasons.push('Popular track');
    }

    // Boost if from favorite artist
    const favoriteArtistIds = favoriteSongs
      .map(fav => fav.artistId)
      .filter((id, index, self) => self.indexOf(id) === index);
    if (favoriteArtistIds.includes(song.artistId)) {
      score += 30;
      reasons.push('Favorite artist');
    }

    // Boost if same genre as favorites
    const favoriteGenres = favoriteSongs.map(s => s.genre);
    if (favoriteGenres.includes(song.genre)) {
      score += 20;
      reasons.push(`Preferred genre: ${song.genre}`);
    }

    // Boost based on listening history
    const playCount = this.listeningHistory.get(song.id) || 0;
    if (playCount > 0) {
      score += Math.min(playCount * 5, 25);
      reasons.push(`Played ${playCount} times`);
    }

    // Boost if in favorites
    if (favoriteIds.includes(song.id)) {
      score += 25;
      reasons.push('In your favorites');
    }

    // Boost for discovery (not played much)
    if (playCount === 0 && !favoriteIds.includes(song.id)) {
      score += 15;
      reasons.push('Discover new music');
    }

    // Boost if similar to recently played
    if (this.recentlyPlayed.length > 0) {
      const recentGenres = new Set(this.recentlyPlayed.slice(0, 5).map(s => s.genre));
      if (recentGenres.has(song.genre)) {
        score += 15;
        reasons.push('Similar to your recent  listening');
      }
    }

    return { score, reasons };
  }

  /**
   * Get songs by mood
   */
  getSongsByMood(mood: MusicMood, limit: number = 20): Song[] {
    const genres = this.moodGenreMap[mood] || [];
    const filtered = this.allSongs.filter(song => genres.includes(song.genre));
    
    // Shuffle and limit
    return filtered
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  /**
   * Get recently played songs
   */
  getRecentlyPlayed(limit: number = 10): Song[] {
    return this.recentlyPlayed.slice(0, limit);
  }

  /**
   * Get listening statistics
   */
  getListeningStats(): ListeningStats {
    if (this.allSongs.length === 0) {
      return {
        totalListeningTime: 0,
        totalSongsPlayed: 0,
        favoriteGenre: Genre.POP,
        topArtists: [],
        recentlyPlayed: [],
        mostPlayedSongs: []
      };
    }

    // Calculate total listening time
    const totalListeningTime = Array.from(this.listeningHistory.entries())
      .reduce((total, [songId, count]) => {
        const song = this.allSongs.find(s => s.id === songId);
        return total + (song ? song.duration * count : 0);
      }, 0);

    // Total songs played
    const totalSongsPlayed = Array.from(this.listeningHistory.values())
      .reduce((a, b) => a + b, 0);

    // Favorite genre
    const genreCounts: Record<string, number> = {};
    this.allSongs.forEach(song => {
      const playCount = this.listeningHistory.get(song.id) || 0;
      if (playCount > 0) {
        genreCounts[song.genre] = (genreCounts[song.genre] || 0) + playCount;
      }
    });
    const favoriteGenre = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as Genre || Genre.POP;

    // Top artists
    const artistCounts: Record<string, number> = {};
    this.allSongs.forEach(song => {
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
        song: this.allSongs.find(s => s.id === songId)!,
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
  }

  /**
   * Get similar songs based on genre and artist
   */
  getSimilarSongs(song: Song, limit: number = 10): Song[] {
    return this.allSongs
      .filter(s => s.id !== song.id)
      .map(s => {
        let similarityScore = 0;
        if (s.genre === song.genre) similarityScore += 40;
        if (s.artistId === song.artistId) similarityScore += 50;
        if (Math.abs(s.duration - song.duration) < 30) similarityScore += 10;
        return { song: s, similarityScore };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .map(item => item.song);
  }
}
