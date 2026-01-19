/**
 * Enums for Music Streaming Application
 */

export enum Genre {
  POP = 'Pop',
  ROCK = 'Rock',
  JAZZ = 'Jazz',
  CLASSICAL = 'Classical',
  HIPHOP = 'Hip Hop',
  ELECTRONIC = 'Electronic',
  COUNTRY = 'Country',
  RNB = 'R&B',
  INDIE = 'Indie',
  ALTERNATIVE = 'Alternative',
  METAL = 'Metal',
  FOLK = 'Folk',
  BLUES = 'Blues',
  REGGAE = 'Reggae'
}

export enum PlaybackState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  LOADING = 'loading',
  ERROR = 'error'
}

export enum RepeatMode {
  OFF = 'off',
  ONE = 'one',
  ALL = 'all'
}
