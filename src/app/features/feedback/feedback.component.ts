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
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

interface FeedbackForm {
  name: string;
  email: string;
  category: string;
  rating: string;
  message: string;
}

@Component({
  selector: 'app-feedback',
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
    MatSelectModule,
    MatRadioModule
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent {
  feedbackData: FeedbackForm = {
    name: '',
    email: '',
    category: '',
    rating: '',
    message: ''
  };

  categories = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'general', label: 'General Feedback' },
    { value: 'support', label: 'Support' }
  ];

  ratings = [
    { value: '1', label: '⭐ Poor' },
    { value: '2', label: '⭐⭐ Fair' },
    { value: '3', label: '⭐⭐⭐ Good' },
    { value: '4', label: '⭐⭐⭐⭐ Very Good' },
    { value: '5', label: '⭐⭐⭐⭐⭐ Excellent' }
  ];

  isLoading = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(form: any): void {
    if (form.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        this.snackBar.open('Thank you for your feedback! We appreciate your input.', 'Close', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });

        // Reset form
        form.resetForm();
        this.isLoading = false;

        // Navigate back to songs
        setTimeout(() => {
          this.router.navigate(['/songs']);
        }, 1500);
      }, 1000);
    }
  }

  onReset(form: any): void {
    form.resetForm();
    this.snackBar.open('Form has been reset', 'Close', {
      duration: 2000
    });
  }
}
