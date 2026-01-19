import { Pipe, PipeTransform } from '@angular/core';
import { Song } from '../../core/models';

/**
 * Pipe to filter songs by artist ID or name
 * Usage: songs | filterByArtist:artistId
 */
@Pipe({
  name: 'filterByArtist',
  standalone: true
})
export class FilterByArtistPipe implements PipeTransform {
  transform(songs: Song[] | null, artistId: string | null): Song[] {
    if (!songs || !artistId) {
      return songs || [];
    }

    return songs.filter(song => song.artistId === artistId);
  }
}
