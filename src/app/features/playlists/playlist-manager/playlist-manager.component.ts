import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MusicService } from '../../../core/services/music.service';
import { Playlist } from '../../../core/models';

@Component({
  selector: 'app-playlist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.playlist ? 'Edit Playlist' : 'Create New Playlist' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="playlistForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Playlist Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter playlist name">
          <mat-error *ngIf="playlistForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
          <mat-error *ngIf="playlistForm.get('name')?.hasError('minlength')">
            Name must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Enter playlist description"
            rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="!playlistForm.valid"
        (click)="onSubmit()">
        {{ data.playlist ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    mat-dialog-content {
      min-width: 400px;
      padding: 1.5rem 0;
    }
  `]
})
export class PlaylistDialogComponent {
  playlistForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PlaylistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { playlist: Playlist | null },
    private fb: FormBuilder
  ) {
    this.playlistForm = this.fb.group({
      name: [data.playlist?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [data.playlist?.description || '']
    });
  }

  onSubmit(): void {
    if (this.playlistForm.valid) {
      this.dialogRef.close(this.playlistForm.value);
    }
  }
}

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './playlist-manager.component.html',
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent implements OnInit, OnDestroy {
  playlists: Playlist[] = [];
  isLoading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private musicService: MusicService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlaylists(): void {
    this.isLoading = true;
    this.musicService.loadPlaylists();

    this.musicService.getPlaylists()
      .pipe(takeUntil(this.destroy$))
      .subscribe(playlists => {
        this.playlists = playlists;
        this.isLoading = false;
      });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PlaylistDialogComponent, {
      width: '500px',
      data: { playlist: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPlaylist(result.name, result.description);
      }
    });
  }

  openEditDialog(playlist: Playlist): void {
    const dialogRef = this.dialog.open(PlaylistDialogComponent, {
      width: '500px',
      data: { playlist }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePlaylist(playlist.id, result.name, result.description);
      }
    });
  }

  private createPlaylist(name: string, description?: string): void {
    const newPlaylist: Omit<Playlist, 'id' | 'createdDate' | 'updatedDate'> = {
      name,
      description,
      songs: [],
      isPublic: false
    };

    this.musicService.createPlaylist(newPlaylist)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Playlist created successfully', 'Close', { duration: 3000 });
          this.loadPlaylists();
        },
        error: () => {
          this.snackBar.open('Failed to create playlist', 'Close', { duration: 3000 });
        }
      });
  }

  private updatePlaylist(playlistId: string, name: string, description?: string): void {
    const updates: Partial<Playlist> = {
      name,
      description
    };

    this.musicService.updatePlaylist(playlistId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Playlist updated successfully', 'Close', { duration: 3000 });
          this.loadPlaylists();
        },
        error: () => {
          this.snackBar.open('Failed to update playlist', 'Close', { duration: 3000 });
        }
      });
  }

  deletePlaylist(playlistId: string, playlistName: string): void {
    if (confirm(`Are you sure you want to delete "${playlistName}"?`)) {
      this.musicService.deletePlaylist(playlistId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Playlist deleted successfully', 'Close', { duration: 3000 });
            this.loadPlaylists();
          },
          error: () => {
            this.snackBar.open('Failed to delete playlist', 'Close', { duration: 3000 });
          }
        });
    }
  }

  viewPlaylist(playlistId: string): void {
    this.router.navigate(['/playlists', playlistId]);
  }

  getTotalDuration(playlist: Playlist): number {
    return playlist.songs.reduce((total, song) => total + song.duration, 0);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  }
}
