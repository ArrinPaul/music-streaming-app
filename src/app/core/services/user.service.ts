import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserPreferences, Song } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY_USER = 'music_app_user';
  private readonly STORAGE_KEY_FAVORITES = 'music_app_favorites';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private favoritesSubject = new BehaviorSubject<string[]>([]);

  public currentUser$ = this.currentUserSubject.asObservable();
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserFromStorage();
    this.loadFavoritesFromStorage();
  }

  /**
   * Load user from local storage
   */
  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.initializeDefaultUser();
      return;
    }

    const userJson = localStorage.getItem(this.STORAGE_KEY_USER);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.initializeDefaultUser();
      }
    } else {
      this.initializeDefaultUser();
    }
  }

  /**
   * Initialize default user
   */
  private initializeDefaultUser(): void {
    const defaultUser: User = {
      id: 'user-1',
      username: 'music_lover',
      email: 'user@example.com',
      displayName: 'Music Lover',
      preferences: {
        theme: 'dark',
        volume: 80,
        repeatMode: 'off',
        shuffle: false,
        autoplay: true,
        quality: 'high'
      },
      createdDate: new Date()
    };

    this.setUser(defaultUser);
  }

  /**
   * Load favorites from local storage
   */
  private loadFavoritesFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const favoritesJson = localStorage.getItem(this.STORAGE_KEY_FAVORITES);
    if (favoritesJson) {
      try {
        const favorites = JSON.parse(favoritesJson);
        this.favoritesSubject.next(favorites);
      } catch (error) {
        console.error('Error loading favorites from storage:', error);
      }
    }
  }

  /**
   * Save user to local storage
   */
  private saveUserToStorage(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(user));
    }
  }

  /**
   * Save favorites to local storage
   */
  private saveFavoritesToStorage(favorites: string[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set current user
   */
  setUser(user: User): void {
    this.currentUserSubject.next(user);
    this.saveUserToStorage(user);
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        preferences: { ...currentUser.preferences, ...preferences }
      };
      this.setUser(updatedUser);
    }
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<Omit<User, 'id' | 'createdDate' | 'preferences'>>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser: User = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  /**
   * Get user preferences
   */
  getPreferences(): UserPreferences | null {
    const user = this.currentUserSubject.value;
    return user ? user.preferences : null;
  }

  /**
   * Get theme preference
   */
  getTheme(): 'light' | 'dark' {
    const preferences = this.getPreferences();
    return preferences?.theme || 'dark';
  }

  /**
   * Set theme preference
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.updatePreferences({ theme });
  }

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    const currentTheme = this.getTheme();
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  // ==================== FAVORITES ====================

  /**
   * Get favorite song IDs
   */
  getFavorites(): string[] {
    return this.favoritesSubject.value;
  }

  /**
   * Check if song is favorited
   */
  isFavorite(songId: string): boolean {
    return this.favoritesSubject.value.includes(songId);
  }

  /**
   * Add song to favorites
   */
  addToFavorites(songId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    if (!currentFavorites.includes(songId)) {
      const updatedFavorites = [...currentFavorites, songId];
      this.favoritesSubject.next(updatedFavorites);
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  /**
   * Remove song from favorites
   */
  removeFromFavorites(songId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(id => id !== songId);
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(songId: string): void {
    if (this.isFavorite(songId)) {
      this.removeFromFavorites(songId);
    } else {
      this.addToFavorites(songId);
    }
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    this.favoritesSubject.next([]);
    this.saveFavoritesToStorage([]);
  }

  // ==================== UTILITY ====================

  /**
   * Clear all user data
   */
  clearUserData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY_USER);
      localStorage.removeItem(this.STORAGE_KEY_FAVORITES);
    }
    this.currentUserSubject.next(null);
    this.favoritesSubject.next([]);
  }

  /**
   * Export user data
   */
  exportUserData(): any {
    return {
      user: this.currentUserSubject.value,
      favorites: this.favoritesSubject.value
    };
  }

  /**
   * Import user data
   */
  importUserData(data: any): void {
    if (data.user) {
      this.setUser(data.user);
    }
    if (data.favorites) {
      this.favoritesSubject.next(data.favorites);
      this.saveFavoritesToStorage(data.favorites);
    }
  }
}
