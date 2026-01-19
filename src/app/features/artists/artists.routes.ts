import { Routes } from '@angular/router';
import { ArtistDetailComponent } from './artist-detail/artist-detail.component';

export const ARTISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./artist-list/artist-list.component').then(m => m.ArtistListComponent)
  },
  {
    path: ':id',
    component: ArtistDetailComponent
  }
];
