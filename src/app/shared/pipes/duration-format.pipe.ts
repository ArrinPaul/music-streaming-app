import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format duration in seconds to mm:ss or hh:mm:ss
 * Usage: duration | durationFormat or duration | durationFormat:'long'
 */
@Pipe({
  name: 'durationFormat',
  standalone: true
})
export class DurationFormatPipe implements PipeTransform {
  transform(seconds: number | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '0:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (format === 'long') {
      if (hours > 0) {
        return `${hours} hr ${minutes} min`;
      }
      return `${minutes} min ${secs} sec`;
    }

    // Short format (mm:ss or hh:mm:ss)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
