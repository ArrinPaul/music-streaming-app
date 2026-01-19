import { Routes } from '@angular/router';
import { PlaylistManagerComponent } from './playlist-manager/playlist-manager.component';

export const PLAYLISTS_ROUTES: Routes = [
  {
    path: '',
    component: PlaylistManagerComponent
  },
  {
    path: ':id',
    loadComponent: () => import('./playlist-detail/playlist-detail.component').then(m => m.PlaylistDetailComponent)
  }
];
