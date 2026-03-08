import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AudioService } from './core/services/audio.service';
import { PlaybackState } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MatIconModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MusicStream - Music Streaming and Playlist Management';

  constructor(public audioService: AudioService) {}

  get isPlaying(): boolean {
    return this.audioService.getState().playbackState === PlaybackState.PLAYING;
  }
}
