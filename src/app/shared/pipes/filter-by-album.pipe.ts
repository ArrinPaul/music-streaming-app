import { Pipe, PipeTransform } from '@angular/core';
import { Song } from '../../core/models';

/**
 * Pipe to filter songs by album ID
 * Usage: songs | filterByAlbum:albumId
 */
@Pipe({
  name: 'filterByAlbum',
  standalone: true
})
export class FilterByAlbumPipe implements PipeTransform {
  transform(songs: Song[] | null, albumId: string | null): Song[] {
    if (!songs || !albumId) {
      return songs || [];
    }

    return songs.filter(song => song.albumId === albumId);
  }
}
