import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (userCredential) => {
        console.log('User logged in:', userCredential.user);
      },
      error: (err) => console.error('Login error:', err)
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => console.log('User logged out'),
      error: (err) => console.error('Logout error:', err)
    });
  }
}
