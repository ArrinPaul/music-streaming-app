import { Routes } from '@angular/router';
import { SongListComponent } from './song-list/song-list.component';

export const SONGS_ROUTES: Routes = [
  {
    path: '',
    component: SongListComponent
  }
];
