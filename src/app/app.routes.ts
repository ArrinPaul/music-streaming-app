import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'songs',
    loadChildren: () => import('./features/songs/songs.routes').then(m => m.SONGS_ROUTES)
  },
  {
    path: 'artists',
    loadChildren: () => import('./features/artists/artists.routes').then(m => m.ARTISTS_ROUTES)
  },
  {
    path: 'playlists',
    loadChildren: () => import('./features/playlists/playlists.routes').then(m => m.PLAYLISTS_ROUTES)
  },
  {
    path: 'now-playing',
    loadChildren: () => import('./features/player/player.routes').then(m => m.PLAYER_ROUTES)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'feedback',
    loadComponent: () => import('./features/feedback/feedback.component').then(m => m.FeedbackComponent)
  },
  {
    path: '**',
    redirectTo: '/songs'
  }
];
