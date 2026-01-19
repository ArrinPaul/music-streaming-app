/**
 * Artist interface representing a music artist
 */
export interface Artist {
  readonly id: string;
  name: string;
  biography?: string;
  imageUrl?: string;
  genres: string[];
  monthlyListeners?: number;
  verified?: boolean;
  socialLinks?: {
    website?: string;
    spotify?: string;
    twitter?: string;
    instagram?: string;
  };
}

/**
 * Artist class implementation
 */
export class ArtistModel implements Artist {
  readonly id: string;
  name: string;
  biography?: string;
  imageUrl?: string;
  genres: string[];
  monthlyListeners: number;
  verified: boolean;
  socialLinks?: {
    website?: string;
    spotify?: string;
    twitter?: string;
    instagram?: string;
  };

  constructor(data: Artist) {
    this.id = data.id;
    this.name = data.name;
    this.biography = data.biography;
    this.imageUrl = data.imageUrl;
    this.genres = data.genres;
    this.monthlyListeners = data.monthlyListeners || 0;
    this.verified = data.verified || false;
    this.socialLinks = data.socialLinks;
  }

  /**
   * Get formatted monthly listeners count
   */
  getFormattedListeners(): string {
    if (this.monthlyListeners >= 1000000) {
      return `${(this.monthlyListeners / 1000000).toFixed(1)}M`;
    } else if (this.monthlyListeners >= 1000) {
      return `${(this.monthlyListeners / 1000).toFixed(1)}K`;
    }
    return this.monthlyListeners.toString();
  }
}
