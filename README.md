# Music Streaming & Playlist Management Application

A modern, feature-rich music streaming application built with Angular 17 and Angular Material. This application provides a comprehensive music listening experience with playlist management, artist exploration, and personalized recommendations.

![Angular Version](https://img.shields.io/badge/Angular-17.3.17-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue?logo=typescript)
![Angular Material](https://img.shields.io/badge/Material-17.3.10-purple?logo=material-design)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components Overview](#components-overview)
- [Services](#services)
- [Pipes and Directives](#pipes-and-directives)
- [Routing](#routing)
- [State Management](#state-management)
- [HTTP Interceptors](#http-interceptors)
- [Theming](#theming)
- [Build and Deployment](#build-and-deployment)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

---

## Features

### Core Functionality
- **Music Playback Controls** - Play, pause, skip, shuffle, and repeat functionality
- **Playlist Management** - Create, edit, delete, and organize custom playlists
- **Artist and Album Exploration** - Browse and discover music by artists and albums
- **Advanced Search** - Search across songs, artists, and albums
- **Favorites System** - Save and manage favorite tracks
- **Personalized Recommendations** - Get song suggestions based on listening history

### User Experience
- **Dark/Light Theme Toggle** - Seamless theme switching with persistent preferences
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **User Authentication** - Login system with form validation
- **Feedback System** - User feedback form with comprehensive validation
- **Material Design** - Modern UI with Angular Material components
- **Performance Optimized** - Lazy loading, AOT compilation, and efficient rendering

### Developer Features
- **RxJS Observables** - Reactive data streams for real-time updates
- **HTTP Interceptors** - Centralized logging and error handling
- **Standalone Components** - Modern Angular architecture
- **Lazy Loading** - Route-based code splitting for faster initial load
- **TypeScript** - Strong typing and enhanced IDE support
- **Custom Pipes and Directives** - Reusable utilities for data transformation

---

## Architecture

### Design Patterns
- **Component-Based Architecture** - Modular, reusable UI components
- **Service-Oriented Architecture** - Centralized business logic and data management
- **Observable Pattern** - Reactive data streams with RxJS
- **Dependency Injection** - Loosely coupled, testable code
- **Lazy Loading Pattern** - On-demand module loading for performance

### Data Flow
```
Components → Services → HTTP Client → Mock JSON Data
     ↓           ↓
  Templates   Observables → Subscribers
     ↓
  User Actions → Events → State Updates
```

---

## Technology Stack

### Core Framework
- **Angular 17.3.17** - Modern web application framework
- **TypeScript 5.4.0** - Type-safe JavaScript
- **RxJS 7.8.0** - Reactive extensions for JavaScript

### UI Components
- **Angular Material 17.3.10** - Material Design components
  - MatCard, MatButton, MatIcon
  - MatFormField, MatInput, MatSelect
  - MatTable, MatPaginator, MatSort
  - MatDialog, MatSnackBar, MatMenu
  - MatSlider, MatChipList, MatCheckbox

### Build & Development
- **Angular CLI 17.3.17** - Command-line tools
- **esbuild** - Ultra-fast bundler
- **Server-Side Rendering (SSR)** - Pre-rendering for SEO
- **Karma & Jasmine** - Unit testing framework

### Additional Libraries
- **@angular/animations** - Smooth transitions and effects
- **@angular/cdk** - Component Dev Kit utilities
- **Zone.js** - Execution context for change detection

---

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Angular CLI (v17.3.17)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd music-streaming-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
ng serve
```

4. **Open browser**
Navigate to `http://localhost:4200/`

### Development Commands

```bash
# Serve with hot reload
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Run linting
ng lint

# Generate component
ng generate component features/component-name --standalone

# Generate service
ng generate service services/service-name
```

---

## Project Structure

```
music-streaming-app/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── models/              # TypeScript interfaces & types
│   │   │   ├── services/            # Business logic services
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── guards/              # Route guards
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── home/                # Home dashboard
│   │   │   ├── song-list/           # Song listing & playback
│   │   │   ├── artist-list/         # Artist browsing
│   │   │   ├── playlist-manager/    # Playlist CRUD operations
│   │   │   ├── music-player/        # Audio player controls
│   │   │   ├── login/               # Authentication
│   │   │   └── feedback/            # User feedback form
│   │   │
│   │   ├── shared/                  # Shared utilities
│   │   │   ├── components/          # Reusable components
│   │   │   │   └── navbar/          # Navigation bar
│   │   │   ├── pipes/               # Custom pipes
│   │   │   │   ├── duration.pipe.ts
│   │   │   │   ├── filter.pipe.ts
│   │   │   │   ├── truncate.pipe.ts
│   │   │   │   └── highlight.pipe.ts
│   │   │   └── directives/          # Custom directives
│   │   │       ├── theme-toggle.directive.ts
│   │   │       └── auto-focus.directive.ts
│   │   │
│   │   ├── app.component.ts         # Root component
│   │   ├── app.config.ts            # App configuration
│   │   └── app.routes.ts            # Route definitions
│   │
│   ├── assets/                      # Static assets
│   │   ├── data/                    # Mock JSON data
│   │   │   ├── songs.json
│   │   │   ├── artists.json
│   │   │   ├── albums.json
│   │   │   └── playlists.json
│   │   └── images/                  # Album covers & images
│   │
│   ├── styles.scss                  # Global styles
│   └── index.html                   # HTML entry point
│
├── angular.json                     # Angular workspace config
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
```

---

## Components Overview

### Feature Components

#### 1. **HomeComponent** (`/home`)
- Dashboard with recommendations and recent activity
- Quick access to playlists and favorite songs
- Statistics display (total songs, artists, playlists)

#### 2. **SongListComponent** (`/songs`)
- Paginated table of all songs
- Sortable columns (title, artist, duration, plays)
- Play button for each song
- Add to playlist/favorites functionality

#### 3. **ArtistListComponent** (`/artists`)
- Grid view of all artists
- Artist card with image and basic info
- Click to view artist details and songs

#### 4. **PlaylistManagerComponent** (`/playlists`)
- View all user playlists
- Create new playlists
- Edit playlist details
- Delete playlists
- Drag-and-drop song reordering

#### 5. **MusicPlayerComponent** (Bottom bar)
- Global audio player controls
- Progress slider with time display
- Volume control
- Shuffle and repeat toggles
- Current song information

#### 6. **LoginComponent** (`/login`)
- Template-driven form with validation
- Email and password fields
- Remember me checkbox
- Password visibility toggle

#### 7. **FeedbackComponent** (`/feedback`)
- Multi-field feedback form
- Category selection dropdown
- Star rating system
- Character-counted text area
- Form validation and reset

### Shared Components

#### **NavbarComponent**
- Application-wide navigation
- Theme toggle button
- User menu with login/logout
- Search functionality
- Responsive mobile menu

---

## Services

### 1. **SongService**
```typescript
getSongs(): Observable<Song[]>
getSongById(id: string): Observable<Song>
addSong(song: Song): Observable<Song>
updateSong(song: Song): Observable<Song>
deleteSong(id: string): Observable<void>
getRecommendations(songId: string): Observable<Song[]>
```

### 2. **PlaylistService**
```typescript
getPlaylists(): Observable<Playlist[]>
getPlaylistById(id: string): Observable<Playlist>
createPlaylist(playlist: Playlist): Observable<Playlist>
updatePlaylist(playlist: Playlist): Observable<Playlist>
deletePlaylist(id: string): Observable<void>
addSongToPlaylist(playlistId: string, songId: string): Observable<void>
removeSongFromPlaylist(playlistId: string, songId: string): Observable<void>
```

### 3. **UserService**
```typescript
getCurrentUser(): Observable<User>
login(credentials: LoginCredentials): Observable<User>
logout(): void
getUserFavorites(): Observable<Song[]>
addToFavorites(songId: string): Observable<void>
removeFromFavorites(songId: string): Observable<void>
```

---

## Pipes and Directives

### Custom Pipes

#### 1. **DurationPipe**
Converts seconds to MM:SS format
```typescript
{{ 245 | duration }} // Output: "4:05"
```

#### 2. **FilterPipe**
Filters array based on search term
```typescript
*ngFor="let song of songs | filter:searchTerm:'title'"
```

#### 3. **TruncatePipe**
Truncates long text with ellipsis
```typescript
{{ longText | truncate:50 }} // Output: "This is a long text that will be trunca..."
```

#### 4. **HighlightPipe**
Highlights search term in text
```typescript
[innerHTML]="songTitle | highlight:searchTerm"
```

### Custom Directives

#### 1. **ThemeToggleDirective**
Toggles between light and dark themes
```typescript
<button appThemeToggle>Toggle Theme</button>
```

#### 2. **AutoFocusDirective**
Auto-focuses input elements on load
```typescript
<input appAutoFocus type="text" />
```

---

## Routing

### Route Configuration

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'songs', component: SongListComponent },
  { path: 'artists', component: ArtistListComponent },
  { path: 'playlists', component: PlaylistManagerComponent },
  { 
    path: 'login', 
    loadComponent: () => import('./features/login/login.component')
      .then(m => m.LoginComponent)
  },
  { 
    path: 'feedback', 
    loadComponent: () => import('./features/feedback/feedback.component')
      .then(m => m.FeedbackComponent)
  },
  { path: '**', redirectTo: '/home' }
];
```

### Lazy Loading
- Login and Feedback components are lazy-loaded
- Reduces initial bundle size
- Improves first load performance

---

## State Management

### Current Implementation
- **Service-based state** - Services hold application state
- **BehaviorSubject** - For reactive state updates
- **Local Storage** - For persistent user preferences

### Example: Theme State
```typescript
private themeSubject = new BehaviorSubject<string>('light');
theme$ = this.themeSubject.asObservable();

toggleTheme(): void {
  const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
  this.themeSubject.next(newTheme);
  localStorage.setItem('theme', newTheme);
}
```

---

## HTTP Interceptors

### 1. **LoggingInterceptor**
Logs all HTTP requests and responses
```typescript
- Request URL, method, timestamp
- Response status, duration
- Console output for debugging
```

### 2. **ErrorHandlerInterceptor**
Centralized error handling
```typescript
- Catches HTTP errors
- Displays user-friendly error messages
- Retry logic for failed requests
- Error logging to console
```

---

## Theming

### Material Theme Customization

The application supports both light and dark themes:

**Light Theme:**
- Primary: Indigo
- Accent: Pink
- Warn: Red

**Dark Theme:**
- Primary: Deep Purple
- Accent: Amber
- Warn: Red

### Theme Toggle
```typescript
// Toggle via directive
<button appThemeToggle>Toggle Theme</button>

// Theme persisted in localStorage
// Automatically applied on page load
```

---

## Build and Deployment

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

### Build Output
```
dist/music-streaming-app/
├── browser/              # Client-side files
│   ├── index.html
│   ├── main.*.js
│   └── assets/
└── server/              # SSR server files
    └── server.mjs
```

### Deployment Options

#### 1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
```bash
ng build --configuration production
# Deploy dist/music-streaming-app/browser/
```

#### 2. **Node.js Server** (With SSR)
```bash
npm run serve:ssr:music-streaming-app
# Runs on http://localhost:4000
```

#### 3. **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/music-streaming-app/browser ./dist
EXPOSE 4000
CMD ["npm", "run", "serve:ssr:music-streaming-app"]
```

---

## Testing

### Unit Testing

The application uses Jasmine and Karma for unit testing.

**Run unit tests:**
```bash
ng test
```

**Run tests with code coverage:**
```bash
ng test --code-coverage
```

**Coverage reports are generated in:**
```
coverage/music-streaming-app/index.html
```

### Test Structure
```
src/
├── app/
│   ├── core/
│   │   ├── services/*.spec.ts
│   │   └── interceptors/*.spec.ts
│   ├── features/
│   │   └── **/*.spec.ts
│   └── shared/
│       ├── pipes/*.spec.ts
│       └── directives/*.spec.ts
```

### Running Specific Tests
```bash
# Test a specific file
ng test --include='**/song.service.spec.ts'

# Run tests in headless mode (CI/CD)
ng test --browsers=ChromeHeadless --watch=false
```

### Best Practices
- Write tests for all services and business logic
- Test component public methods and user interactions
- Mock HTTP calls using HttpClientTestingModule
- Aim for 80%+ code coverage
- Run tests before committing code

---

## Future Enhancements

### Planned Features
- [ ] Real backend API integration
- [ ] Audio visualization and equalizer
- [ ] Social sharing of playlists
- [ ] Collaborative playlists
- [ ] Lyrics display and synchronized highlighting
- [ ] Advanced music recommendations (ML-based)
- [ ] Cross-device playback sync
- [ ] Offline mode with service workers (PWA)
- [ ] Voice commands integration
- [ ] Podcast support

### Technical Improvements
- [ ] NgRx for state management
- [ ] Comprehensive unit and E2E tests
- [ ] Performance monitoring and analytics
- [ ] Accessibility (WCAG 2.1 AA compliance)
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA) features
- [ ] WebSocket for real-time updates

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Ensure all tests pass before submitting

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

Built using Angular 17

---

## Acknowledgments

- Angular team for the amazing framework
- Angular Material for UI components
- Spotify for design inspiration
- Open source community for valuable resources

---

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Submit feedback through the app's feedback form

---
