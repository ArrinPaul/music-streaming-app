import { Pipe, PipeTransform } from '@angular/core';
import { Song, Genre } from '../../core/models';

/**
 * Pipe to filter songs by genre
 * Usage: songs | filterByGenre:genre
 */
@Pipe({
  name: 'filterByGenre',
  standalone: true
})
export class FilterByGenrePipe implements PipeTransform {
  transform(songs: Song[] | null, genre: Genre | null): Song[] {
    if (!songs || !genre) {
      return songs || [];
    }

    return songs.filter(song => song.genre === genre);
  }
}
