import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../core/services/user.service';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData: LoginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  hidePassword = true;
  isLoading = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  onSubmit(form: any): void {
    if (form.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        // Mock login logic - accept any credentials for demo
        if (this.loginData.email && this.loginData.password) {
          this.snackBar.open('Login successful! Welcome back.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.router.navigate(['/songs']);
        } else {
          this.snackBar.open('Invalid credentials. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
        
        this.isLoading = false;
      }, 1000);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
