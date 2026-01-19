import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../../core/services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentTheme: 'light' | 'dark' = 'dark';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;
    this.currentTheme = this.userService.getTheme();
  }

  toggleTheme(): void {
    this.userService.toggleTheme();
    this.currentTheme = this.userService.getTheme();
    // Apply theme to document
    document.body.classList.toggle('light-theme', this.currentTheme === 'light');
    document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
  }
}
