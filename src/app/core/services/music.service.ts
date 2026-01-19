import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { Song, Artist, Album, Playlist } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly DATA_PATH = 'assets/data';
  
  // State management with BehaviorSubjects
  private songsSubject = new BehaviorSubject<Song[]>([]);
  private artistsSubject = new BehaviorSubject<Artist[]>([]);
  private albumsSubject = new BehaviorSubject<Album[]>([]);
  private playlistsSubject = new BehaviorSubject<Playlist[]>([]);
  
  // Public observables
  public songs$ = this.songsSubject.asObservable();
  public artists$ = this.artistsSubject.asObservable();
  public albums$ = this.albumsSubject.asObservable();
  public playlists$ = this.playlistsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllData();
  }

  /**
   * Load all data on service initialization
   */
  private loadAllData(): void {
    this.loadSongs().subscribe();
    this.loadArtists().subscribe();
    this.loadAlbums().subscribe();
    this.loadPlaylists().subscribe();
  }

  // ==================== SONGS ====================

  /**
   * Load songs from JSON file
   */
  loadSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.DATA_PATH}/songs.json`).pipe(
      tap(songs => this.songsSubject.next(songs)),
      catchError(error => {
        console.error('Error loading songs:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all songs
   */
  getSongs(): Observable<Song[]> {
    return this.songs$;
  }

  /**
   * Get song by ID
   */
  getSongById(id: string): Observable<Song | undefined> {
    return this.songs$.pipe(
      map(songs => songs.find(song => song.id === id))
    );
  }

  /**
   * Get songs by artist
   */
  getSongsByArtist(artistId: string): Observable<Song[]> {
    return this.songs$.pipe(
      map(songs => songs.filter(song => song.artistId === artistId))
    );
  }

  /**
   * Get songs by album
   */
  getSongsByAlbum(albumId: string): Observable<Song[]> {
    return this.songs$.pipe(
      map(songs => songs.filter(song => song.albumId === albumId))
    );
  }

  /**
   * Get songs by genre
   */
  getSongsByGenre(genre: string): Observable<Song[]> {
    return this.songs$.pipe(
      map(songs => songs.filter(song => song.genre === genre))
    );
  }

  /**
   * Search songs by title or artist
   */
  searchSongs(query: string): Observable<Song[]> {
    const lowerQuery = query.toLowerCase();
    return this.songs$.pipe(
      map(songs => songs.filter(song => 
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artistName.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  // ==================== ARTISTS ====================

  /**
   * Load artists from JSON file
   */
  loadArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.DATA_PATH}/artists.json`).pipe(
      tap(artists => this.artistsSubject.next(artists)),
      catchError(error => {
        console.error('Error loading artists:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all artists
   */
  getArtists(): Observable<Artist[]> {
    return this.artists$;
  }

  /**
   * Get artist by ID
   */
  getArtistById(id: string): Observable<Artist | undefined> {
    return this.artists$.pipe(
      map(artists => artists.find(artist => artist.id === id))
    );
  }

  /**
   * Search artists by name
   */
  searchArtists(query: string): Observable<Artist[]> {
    const lowerQuery = query.toLowerCase();
    return this.artists$.pipe(
      map(artists => artists.filter(artist => 
        artist.name.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  // ==================== ALBUMS ====================

  /**
   * Load albums from JSON file
   */
  loadAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.DATA_PATH}/albums.json`).pipe(
      tap(albums => this.albumsSubject.next(albums)),
      catchError(error => {
        console.error('Error loading albums:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all albums
   */
  getAlbums(): Observable<Album[]> {
    return this.albums$;
  }

  /**
   * Get album by ID
   */
  getAlbumById(id: string): Observable<Album | undefined> {
    return this.albums$.pipe(
      map(albums => albums.find(album => album.id === id))
    );
  }

  /**
   * Get albums by artist
   */
  getAlbumsByArtist(artistId: string): Observable<Album[]> {
    return this.albums$.pipe(
      map(albums => albums.filter(album => album.artistId === artistId))
    );
  }

  // ==================== PLAYLISTS ====================

  /**
   * Load playlists from JSON file
   */
  loadPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.DATA_PATH}/playlists.json`).pipe(
      tap(playlists => this.playlistsSubject.next(playlists)),
      catchError(error => {
        console.error('Error loading playlists:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all playlists
   */
  getPlaylists(): Observable<Playlist[]> {
    return this.playlists$;
  }

  /**
   * Get playlist by ID
   */
  getPlaylistById(id: string): Observable<Playlist | undefined> {
    return this.playlists$.pipe(
      map(playlists => playlists.find(playlist => playlist.id === id))
    );
  }

  /**
   * Create new playlist
   */
  createPlaylist(playlist: Omit<Playlist, 'id' | 'createdDate' | 'updatedDate'>): Observable<Playlist> {
    const newPlaylist: Playlist = {
      ...playlist,
      id: `playlist-${Date.now()}`,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const currentPlaylists = this.playlistsSubject.value;
    this.playlistsSubject.next([...currentPlaylists, newPlaylist]);
    
    return of(newPlaylist);
  }

  /**
   * Update playlist
   */
  updatePlaylist(id: string, updates: Partial<Playlist>): Observable<Playlist | undefined> {
    const currentPlaylists = this.playlistsSubject.value;
    const index = currentPlaylists.findIndex(p => p.id === id);
    
    if (index !== -1) {
      const updatedPlaylist = {
        ...currentPlaylists[index],
        ...updates,
        updatedDate: new Date()
      };
      
      const newPlaylists = [...currentPlaylists];
      newPlaylists[index] = updatedPlaylist;
      this.playlistsSubject.next(newPlaylists);
      
      return of(updatedPlaylist);
    }
    
    return of(undefined);
  }

  /**
   * Delete playlist
   */
  deletePlaylist(id: string): Observable<boolean> {
    const currentPlaylists = this.playlistsSubject.value;
    const filteredPlaylists = currentPlaylists.filter(p => p.id !== id);
    
    if (filteredPlaylists.length < currentPlaylists.length) {
      this.playlistsSubject.next(filteredPlaylists);
      return of(true);
    }
    
    return of(false);
  }

  /**
   * Add song to playlist
   */
  addSongToPlaylist(playlistId: string, songId: string): Observable<boolean> {
    const currentPlaylists = this.playlistsSubject.value;
    const currentSongs = this.songsSubject.value;
    
    const playlistIndex = currentPlaylists.findIndex(p => p.id === playlistId);
    const song = currentSongs.find(s => s.id === songId);
    
    if (playlistIndex !== -1 && song) {
      const playlist = currentPlaylists[playlistIndex];
      
      // Check if song already exists in playlist
      if (!playlist.songs.some(s => s.id === songId)) {
        const updatedPlaylist = {
          ...playlist,
          songs: [...playlist.songs, song],
          updatedDate: new Date()
        };
        
        const newPlaylists = [...currentPlaylists];
        newPlaylists[playlistIndex] = updatedPlaylist;
        this.playlistsSubject.next(newPlaylists);
        
        return of(true);
      }
    }
    
    return of(false);
  }

  /**
   * Remove song from playlist
   */
  removeSongFromPlaylist(playlistId: string, songId: string): Observable<boolean> {
    const currentPlaylists = this.playlistsSubject.value;
    const playlistIndex = currentPlaylists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex !== -1) {
      const playlist = currentPlaylists[playlistIndex];
      const updatedSongs = playlist.songs.filter(s => s.id !== songId);
      
      const updatedPlaylist = {
        ...playlist,
        songs: updatedSongs,
        updatedDate: new Date()
      };
      
      const newPlaylists = [...currentPlaylists];
      newPlaylists[playlistIndex] = updatedPlaylist;
      this.playlistsSubject.next(newPlaylists);
      
      return of(true);
    }
    
    return of(false);
  }
}
