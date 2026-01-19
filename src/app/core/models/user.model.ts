/**
 * User interface representing application user
 */
export interface User {
  readonly id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdDate: Date;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  volume: number; // 0-100
  repeatMode: 'off' | 'one' | 'all';
  shuffle: boolean;
  autoplay: boolean;
  quality: 'low' | 'medium' | 'high';
}

/**
 * User class implementation
 */
export class UserModel implements User {
  readonly id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdDate: Date;

  constructor(data: User) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.displayName = data.displayName;
    this.avatarUrl = data.avatarUrl;
    this.preferences = data.preferences || this.getDefaultPreferences();
    this.createdDate = data.createdDate;
  }

  /**
   * Get default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'dark',
      volume: 80,
      repeatMode: 'off',
      shuffle: false,
      autoplay: true,
      quality: 'high'
    };
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }
}
